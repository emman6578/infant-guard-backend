import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { successHandler } from "../../Middleware/ErrorHandler";
import { AuthRequest } from "../../Middleware/DriverAuthMiddleware";

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

//must fetch this from the delivery load

export const getDeliveriesbyDriverLoggedin = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;
    // Fetch all deliveries for the given admin
    const deliveries = await prisma.driverLoad.findMany({
      where: { driver_id: driverId },
      include: {
        DriverLoadProducts: {
          include: {
            Product: {
              select: { name: true, price: true, wholesale_price: true },
            },
          },
        },
      },
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
            total: true,
            wholesale_total: true,
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

/*
      Steps

      First from req.body
        {
          products:[
          product_id:product id here,
          quantity: 10
          ],

          customerid: customerid here,
          saleType: identify if wholesale price or regular price
          paymentOptions: "GCASH","PAY_LATER"
               

        }

        Logic:

        1. after getting the product id and quantity in the request body
        2. fetch the deliveryload based on the driverId check if the product exist in the deliveryloadproducts
        3. after that recalculate the quantity,total,wholesale_total in the deliveryloadproducts

        note: the saletype is only there because that is the basis of whether you get the regular price or wholesale_price this is to identify where to deduct
       
        

    */

export const addToSales = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    //   const driverId = req.driver?.id;
    //   const { products, customerid, saleType, paymentOptions } = req.body;
    //   if (!driverId || !products || !customerid || !saleType || !paymentOptions) {
    //     res.status(400);
    //     throw new Error("Missing required fields");
    //   }
    //   // Fetch the driver's delivery load
    //   const driverLoad = await prisma.driverLoad.findFirst({
    //     where: { driver_id: driverId },
    //     include: {
    //       DriverLoadProducts: true,
    //     },
    //   });
    //   if (!driverLoad) {
    //     res.status(404);
    //     throw new Error("Driver load not found");
    //   }
    //   let totalSales = 0;
    //   // Check and update each product in the delivery load
    //   for (const product of products) {
    //     const { product_id, quantity } = product;
    //     const deliveryProduct = driverLoad.DriverLoadProducts.find(
    //       (dp) => dp.product_id === product_id
    //     );
    //     if (!deliveryProduct) {
    //       res.status(404);
    //       throw new Error(
    //         `Product with ID ${product_id} not found in delivery load`
    //       );
    //     }
    //     if (deliveryProduct.quantity < quantity) {
    //       res.status(400);
    //       throw new Error(
    //         `Insufficient quantity for product with ID ${product_id}`
    //       );
    //     }
    //     // Determine the price based on saleType
    //     const price =
    //       saleType === "wholesale"
    //         ? deliveryProduct.wholesale_total
    //         : deliveryProduct.total;
    //     totalSales += price * quantity;
    //     // Update the product in the delivery load
    //     await prisma.driverLoadProducts.update({
    //       where: { id: deliveryProduct.id },
    //       data: {
    //         quantity: deliveryProduct.quantity - quantity,
    //         total:
    //           deliveryProduct.total -
    //           (deliveryProduct.total / deliveryProduct.quantity) * quantity,
    //         wholesale_total:
    //           deliveryProduct.wholesale_total -
    //           (deliveryProduct.wholesale_total / deliveryProduct.quantity) *
    //             quantity,
    //       },
    //     });
    //   }
    //   // Create a new DriverSales record
    //   const driverSales = await prisma.driverSales.create({
    //     data: {
    //       sales: totalSales,
    //       status: "SOLD",
    //       paymentOptions: paymentOptions,
    //       Customer: {
    //         connect: { id: customerid },
    //       },
    //       driver: {
    //         connect: { id: driverId },
    //       },
    //       Product: {
    //         connect: products.map((product: any) => ({ id: product.product_id })),
    //       },
    //     },
    //   });
    //   successHandler(driverSales, res, "POST");

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

      if (!driverLoadProduct) {
        res.status(404);
        throw new Error(
          `Product with ID ${product_id} not found in driver load`
        );
      }

      if (driverLoadProduct.quantity < quantity) {
        res.status(400);
        throw new Error(`Insufficient quantity for product ID ${product_id}`);
      }

      const productPrice =
        saleType === "wholesale"
          ? driverLoadProduct.Product!.wholesale_price
          : driverLoadProduct.Product!.price;

      const totalSale = productPrice * quantity;

      await prisma.driverLoadProducts.update({
        where: { id: driverLoadProduct.id },
        data: {
          quantity: driverLoadProduct.quantity - quantity,
          total:
            saleType === "wholesale"
              ? driverLoadProduct.total
              : driverLoadProduct.total - totalSale,
          wholesale_total:
            saleType === "wholesale"
              ? driverLoadProduct.wholesale_total - totalSale
              : driverLoadProduct.wholesale_total,
        },
      });

      await prisma.driverSales.create({
        data: {
          product_id,
          sales: totalSale,
          status: "SOLD",
          paymentOptions,
          customerId: customerid,
          driver_id: driverId,
        },
      });
    }

    successHandler("Sale added successfully", res, "POST");
  }
);
