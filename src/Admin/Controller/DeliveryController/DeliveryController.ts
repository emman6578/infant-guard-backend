import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { successHandler } from "../../Middleware/ErrorHandler";
import { AuthRequest } from "../../Middleware/authMiddleware";

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

    // Check if any of the productInCartIds already exist for the given driverId

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

    //fetch driverload based on driver id
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { DriverLoad: true },
    });

    // Create a constant holding all the values in the fetched model
    const productDetails = productInCarts.map((productInCart) => ({
      productId: productInCart.product_id,
      productName: productInCart.product.name,
      quantity: productInCart.quantity,
      total: productInCart.total,
      wholesalePriceTotal: productInCart.wholesale_price_total,
    }));

    const id = productDetails.map((id) => id.productId);

    // Create DriverLoadProducts records based on productDetails
    const createdDriverLoadProducts = await Promise.all(
      productDetails.map(async (detail) => {
        try {
          const createdProduct = await prisma.driverLoadProducts.create({
            data: {
              Product: {
                connect: { id: detail.productId },
              },
              quantity: detail.quantity,
              total: detail.total,
              wholesale_total: detail.wholesalePriceTotal,
              DriverLoad: {
                connect: { driver_id: driverId },
              },
              admin: {
                connect: { id: adminId },
              },
            },
          });
          return createdProduct;
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

    // Check if createdDriverLoadProducts is falsy or empty
    if (!createdDriverLoadProducts || createdDriverLoadProducts.length === 0) {
      throw new Error("Failed to create DriverLoadProducts.");
    }
    // Calculate aggregated values
    const totalLoadProducts = productDetails.reduce(
      (acc, detail) => acc + detail.quantity,
      0
    );
    const expectedSales = productDetails.reduce(
      (acc, detail) => acc + detail.total,
      0
    );
    const expectedSalesWholesale = productDetails.reduce(
      (acc, detail) => acc + detail.wholesalePriceTotal,
      0
    );

    // Update DriverLoad with aggregated values
    const updatedDriverLoad = await prisma.driverLoad.update({
      where: { driver_id: driverId },
      data: {
        total_load_products: totalLoadProducts,
        expected_sales: expectedSales,
        expected_sales_wholesale: expectedSalesWholesale,
      },
    });

    successHandler(updatedDriverLoad, res, "POST");
  }
);

export const getDeliveries = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // Fetch all deliveries for the given admin
    const deliveries = await prisma.driverLoad.findMany({
      include: { DriverLoadProducts: true },
    });

    successHandler(deliveries, res, "GET");
  }
);
