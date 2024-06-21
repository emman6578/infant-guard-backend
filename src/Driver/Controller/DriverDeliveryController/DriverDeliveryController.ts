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

    const allUsers = await prisma.driver.findMany({
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
    const deliveries = await prisma.driverLoad.findMany({
      where: { driver_id: driverId },
    });

    successHandler(deliveries, res, "GET");
  }
);

export const listOfProductsforSale = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;
    // Fetch all deliveries for the given admin
    const deliveries = await prisma.driverLoad.findMany({
      where: { driver_id: driverId },
      select: {
        DriverLoadProducts: {
          select: {
            quantity: true,
            Product: {
              select: {
                id: true,
                name: true,
                price: true,
                wholesale_price: true,
              },
            },
          },
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

    for (const { product_id, quantity } of products) {
      const driverLoadProduct = driverLoad.DriverLoadProducts.find(
        (p) => p.product_id === product_id
      );

      // Validate products
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

      // Validate customer ID
      if (!validateIdParams(customerid)) {
        res.status(400);
        throw new Error("Invalid customer ID");
      }

      // Validate saleType
      if (!["WHOLESALE", "RETAIL"].includes(saleType)) {
        res.status(400);
        throw new Error("Invalid sale type");
      }

      // Validate paymentOptions
      if (!["CASH", "PAY_LATER", "GCASH"].includes(paymentOptions)) {
        res.status(400);
        throw new Error("Invalid payment option");
      }

      let ProductName;

      if (!driverLoadProduct) {
        const product = await prisma.product.findUnique({
          where: { id: product_id },
          select: { name: true },
        });
        ProductName = product ? product.name : `ID ${product_id}`;
        res.status(404);
        throw new Error(`Product ${ProductName} not found in driver load`);
      }

      if (!driverLoadProduct) {
        res.status(404);
        throw new Error(
          `Product with ID ${ProductName} not found in driver load`
        );
      }

      if (driverLoadProduct.quantity <= quantity) {
        res.status(400);
        throw new Error(
          `Insufficient quantity for product ${driverLoadProduct.Product?.name}`
        );
      }

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

      let balance;
      if (paymentOptions === "PAY_LATER" || paymentOptions === "GCASH") {
        balance = totalSale;
      } else {
        balance = 0;
      }

      await prisma.driverLoadProducts.update({
        where: { id: driverLoadProduct.id },
        data: {
          quantity: driverLoadProduct.quantity - quantity,
        },
      });

      await prisma.driverSales.create({
        data: {
          product_id,
          sales: totalSale,
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
