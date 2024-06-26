import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { successHandler } from "../../Middleware/ErrorHandler";
import { AuthRequest } from "../../Middleware/authMiddleware";
import { validateIdParams } from "../../Helpers/validateIdParams";

const prisma = new PrismaClient();

export const addToDelivery = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      productInCartIds,
      driverId,
    }: { productInCartIds: string[]; driverId: string } = req.body;

    // Get the admin id
    const adminId = req.admin?.id;
    if (!adminId) {
      throw new Error("User ID is required");
    }

    // Validate that id is a string and is a valid UUID
    if (typeof driverId !== "string" || !validateIdParams(driverId)) {
      throw new Error("Invalid product driver ID format");
    }

    if (!Array.isArray(productInCartIds)) {
      res.status(400);
      throw new Error("productInCartIds must be an array.");
    }

    for (const id of productInCartIds) {
      if (!validateIdParams(id)) {
        res.status(400);
        throw new Error(
          `Invalid productInCartId '${id}'. Must be a valid UUID.`
        );
      }
    }

    // Fetch products in the cart to add to delivery
    const productInCarts = await prisma.productInCart.findMany({
      where: {
        id: { in: productInCartIds },
      },
      include: {
        product: true,
      },
    });

    if (productInCarts.length === 0) {
      res.status(400);
      throw new Error("No valid ProductInCart items found");
    }

    // Create a constant holding all the values in the fetched model
    const productDetails = productInCarts.map((productInCart) => ({
      productId: productInCart.product_id,
      productName: productInCart.product.name,
      quantity: productInCart.quantity,
      total: productInCart.total,
      wholesalePriceTotal: productInCart.wholesale_price_total,
    }));

    // Fetch existing DriverLoadProducts for the driver
    const existingDriverLoadProducts = await prisma.driverLoadProducts.findMany(
      {
        where: {
          DriverLoad: {
            driver_id: driverId,
          },
          Product: {
            id: {
              in: productDetails.map((detail) => detail.productId),
            },
          },
        },
      }
    );

    // Update or create DriverLoadProducts records based on productDetails
    const updatedDriverLoadProducts = await Promise.all(
      productDetails.map(async (detail) => {
        const existingProduct = existingDriverLoadProducts.find(
          (p) => p.product_id === detail.productId
        );

        try {
          if (existingProduct) {
            // If the product already exists for the driver, update it
            const updatedProduct = await prisma.driverLoadProducts.update({
              where: {
                id: existingProduct.id,
              },
              data: {
                quantity: {
                  increment: detail.quantity,
                },
              },
            });

            return updatedProduct;
          } else {
            // Otherwise, create a new DriverLoadProducts record
            const createdProduct = await prisma.driverLoadProducts.create({
              data: {
                Product: {
                  connect: { id: detail.productId },
                },
                quantity: detail.quantity,

                DriverLoad: {
                  connect: { driver_id: driverId },
                },
                admin: {
                  connect: { id: adminId },
                },
              },
            });

            return createdProduct;
          }
        } catch (error: any) {
          if (error.code === "P2002") {
            // Handle uniqueness constraint violation
            throw new Error(
              `Product ID ${detail.productId} already exists in DriverLoadProducts.`
            );
          }
          throw error;
        }
      })
    );

    // Check if updatedDriverLoadProducts is falsy or empty
    if (!updatedDriverLoadProducts || updatedDriverLoadProducts.length === 0) {
      res.status(400);
      throw new Error("Failed to update or create DriverLoadProducts.");
    }

    // Fetch all deliveries for the given driver
    const deliveries = await prisma.driverLoad.findMany({
      where: { driver_id: driverId },
      include: {
        DriverLoadProducts: {
          include: {
            Product: {
              select: { quantity: true, price: true, wholesale_price: true },
            },
          },
        },
      },
    });

    let updateDriverLoad;
    // Calculate total_load_products, expected_sales, expected_sales_wholesale
    for (const delivery of deliveries) {
      let totalLoadProducts = 0;
      let expectedSales = 0;
      let expectedSalesWholesale = 0;

      for (const loadProduct of delivery.DriverLoadProducts) {
        if (loadProduct.Product) {
          totalLoadProducts += loadProduct.quantity;
          expectedSales += loadProduct.quantity * loadProduct.Product.price;
          expectedSalesWholesale +=
            loadProduct.quantity * loadProduct.Product.wholesale_price;
        }
      }

      // Update the DriverLoad with the recalculated values
      updateDriverLoad = await prisma.driverLoad.update({
        where: { id: delivery.id },
        data: {
          total_load_products: totalLoadProducts,
          expected_sales: expectedSales,
          expected_sales_wholesale: expectedSalesWholesale,
        },
      });
    }

    successHandler(updateDriverLoad, res, "POST");
  }
);

export const getDeliveries = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // Fetch all deliveries for the given admin
    const deliveries = await prisma.driverLoad.findMany({
      include: {
        DriverLoadProducts: {
          include: {
            Product: {
              select: {
                name: true,
                quantity: true,
                price: true,
                wholesale_price: true,
              },
            },
          },
        },
        driver: true,
      },
    });

    successHandler(deliveries, res, "GET");
  }
);

export const getDrivers = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // Fetch all deliveries for the given admin
    const drivers = await prisma.driver.findMany({
      include: { DriverLoad: true },
    });

    successHandler(drivers, res, "GET");
  }
);
