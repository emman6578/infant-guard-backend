import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { successHandler } from "../../Middleware/ErrorHandler";
import { AuthRequest } from "../../Middleware/DriverAuthMiddleware";
import { validateIdParams } from "../../Helpers/validateIdParams";

const prisma = new PrismaClient();

//driver controller
export const getCurrentlyLoggedInDriver = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;

    const allUsers = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { DriverLoad: true },
    });

    if (!allUsers) {
      throw new Error("Error Getting currently logged in driver");
    }

    successHandler(allUsers, res, "GET");
  }
);

export const getDeliveriesbyDriverLoggedin = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;
    // Fetch all deliveries for the given admin
    const deliveries = await prisma.driverLoad.findUnique({
      where: { driver_id: driverId },
    });

    successHandler(deliveries, res, "GET");
  }
);

export const updateDeliveriesbyDriverLoggedin = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;

    // Fetch all deliveries for the given driver
    const deliveries = await prisma.driverLoad.findUnique({
      where: { driver_id: driverId },
      include: {
        DriverLoadProducts: {
          include: {
            Product: true,
          },
        },
      },
    });

    if (!deliveries) {
      throw new Error("Deliveries not found");
    }

    // Recalculate values
    let totalLoadProducts = 0;
    let expectedSales = 0;
    let expectedSalesWholesale = 0;

    deliveries.DriverLoadProducts.forEach((loadProduct) => {
      totalLoadProducts += loadProduct.quantity;
      expectedSales += loadProduct.quantity * loadProduct.Product!.price;
      expectedSalesWholesale +=
        loadProduct.quantity * loadProduct.Product!.wholesale_price;
    });

    deliveries.total_load_products = totalLoadProducts;
    deliveries.expected_sales = expectedSales;
    deliveries.expected_sales_wholesale = expectedSalesWholesale;

    await prisma.driverLoad.update({
      where: { driver_id: driverId },
      data: {
        total_load_products: totalLoadProducts,
        expected_sales: expectedSales,
        expected_sales_wholesale: expectedSalesWholesale,
      },
    });

    successHandler(deliveries, res, "GET");
  }
);

export const listOfProductsforSale = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;
    // Fetch all deliveries for the given admin
    const deliveries = await prisma.driverLoad.findUnique({
      where: { driver_id: driverId },

      select: {
        DriverLoadProducts: {
          select: {
            quantity: true,
            Product: {
              select: {
                id: true,
                barcode: true,
                name: true,
                price: true,
                wholesale_price: true,
              },
            },
          },
          orderBy: { quantity: "desc" },
        },
      },
    });

    successHandler(deliveries, res, "GET");
  }
);

export const addToSales = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;
    const { products, customerid, saleType, paymentOptions } = req.body;

    const driverLoad = await prisma.driverLoad.findUnique({
      where: { driver_id: driverId },
      include: {
        DriverLoadProducts: {
          include: {
            Product: true,
          },
        },
      },
    });

    if (!driverLoad) {
      res.status(404);
      throw new Error("Driver load not found");
    }

    // Validate input
    if (
      !Array.isArray(products) ||
      products.some(
        ({ product_id, quantity }) =>
          !validateIdParams(product_id) ||
          typeof quantity !== "number" ||
          quantity === 0
      )
    ) {
      res.status(400);
      throw new Error(
        "Invalid products format or invalid product id or quantity or the quantity is zero"
      );
    }

    if (!validateIdParams(customerid)) {
      res.status(400);
      throw new Error("Invalid customer ID");
    }

    if (!["WHOLESALE", "RETAIL"].includes(saleType)) {
      res.status(400);
      throw new Error("Invalid sale type");
    }

    if (!["CASH", "PAY_LATER", "GCASH"].includes(paymentOptions)) {
      res.status(400);
      throw new Error("Invalid payment option");
    }

    // Check for sufficient quantity in all products first
    let insufficientProducts = [];
    let sufficientProducts = [];

    for (const { product_id, quantity } of products) {
      const driverLoadProduct = driverLoad.DriverLoadProducts.find(
        (p) => p.product_id === product_id
      );

      if (!driverLoadProduct) {
        const product = await prisma.product.findUnique({
          where: { id: product_id },
          select: { name: true },
        });
        const productName = product ? product.name : `ID ${product_id}`;
        insufficientProducts.push(
          `Product ${productName} not found in driver load`
        );
      } else if (driverLoadProduct.quantity < quantity) {
        insufficientProducts.push(
          `\nInsufficient quantity for product ${driverLoadProduct.Product?.name}`
        );
      } else {
        sufficientProducts.push(driverLoadProduct);
      }
    }

    // If there are any insufficient products, throw an error
    if (insufficientProducts.length > 0) {
      res.status(400);
      throw new Error(
        `\n\nValidation failed: ${insufficientProducts.join(", ")}`
      );
    }

    // Proceed with the update if all validations pass
    for (const driverLoadProduct of sufficientProducts) {
      const { product_id, quantity } = products.find(
        (p) => p.product_id === driverLoadProduct.product_id
      );

      const productPrice =
        saleType === "WHOLESALE"
          ? driverLoadProduct.Product!.wholesale_price
          : driverLoadProduct.Product!.price;

      const paymentStatus =
        paymentOptions === "PAY_LATER"
          ? "UNPAID"
          : paymentOptions === "GCASH"
          ? "PROCESSING"
          : "PAID";

      const totalSale = productPrice * quantity;

      const balance =
        paymentOptions === "PAY_LATER" || paymentOptions === "GCASH"
          ? totalSale
          : 0;

      const sales =
        paymentOptions === "PAY_LATER" || paymentOptions === "GCASH"
          ? 0
          : totalSale;

      await prisma.driverLoadProducts.update({
        where: { id: driverLoadProduct.id },
        data: {
          quantity: driverLoadProduct.quantity - quantity,
        },
      });

      await prisma.saleSummary.create({
        data: {
          product_id,
          sales,
          saleType: saleType,
          paymentStatus,
          balance,
          quantity,
          status: "SOLD",
          paymentOptions,
          customerId: customerid,
          driver_id: driverId,
        },
      });

      await prisma.driverLoad.update({
        where: { driver_id: driverId },
        data: {
          total_load_products: {
            decrement: quantity,
          },
        },
      });

      await prisma.product.update({
        where: { id: product_id },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });
    }

    successHandler("Sale added successfully", res, "POST");
  }
);
