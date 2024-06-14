import { PrismaClient, Admin } from "@prisma/client";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { successHandler } from "../../Middleware/ErrorHandler";
import { AuthRequest } from "../../Middleware/authMiddleware";

const prisma = new PrismaClient();

export const addToDelivery = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      productInCartIds,
    }: { driverId: string; productInCartIds: string[] } = req.body;

    //get the admin id

    const adminId = req.admin?.id;
    if (!adminId) {
      throw new Error("User ID is required");
    }

    //fetch products in the cart to add to delivery

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

    // Check if the products are already in a delivery
    const existingDeliveries = await prisma.delivery.findMany({
      where: {
        Products: {
          some: {
            id: {
              in: productInCarts.map((item) => item.product_id),
            },
          },
        },
      },
      include: {
        Products: true,
      },
    });

    if (existingDeliveries.length) {
      // Delete existing deliveries
      await prisma.delivery.deleteMany({
        where: {
          id: {
            in: existingDeliveries.map((delivery) => delivery.id),
          },
        },
      });
    }

    // Calculate total price and quantity
    const total = productInCarts.reduce((acc, item) => acc + item.total, 0);
    const totalWholesalePrice = productInCarts.reduce(
      (acc, item) => acc + item.wholesale_price_total,
      0
    );
    const quantity = productInCarts.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    // Get product IDs from ProductInCart items
    const productIds = productInCarts.map((item) => item.product.id);

    // Create new order
    const newDelivery = await prisma.delivery.create({
      data: {
        total,
        wholesale_price_total: totalWholesalePrice,
        quantity,
        admin_id: adminId,
        Products: {
          connect: productIds.map((id) => ({ id })),
        },
      },
      include: { Products: true },
    });

    successHandler(newDelivery, res, "POST");
  }
);

export const getDeliveries = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // Fetch all deliveries for the given admin
    const deliveries = await prisma.delivery.findMany({
      select: {
        id: true,
        quantity: true,
        total: true,
        wholesale_price_total: true,
        status: true,
        Products: {
          select: {
            name: true,
          },
        },
      },
    });

    successHandler(deliveries, res, "GET");
  }
);

export const confirmDelivery = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const {
      deliveryIds,
      driverId,
    }: { deliveryIds: string[]; driverId: string } = req.body;

    // Fetch the delivery details for all delivery IDs
    const deliveries = await prisma.delivery.findMany({
      where: { id: { in: deliveryIds } },
      include: { Products: true },
    });

    if (deliveries.length === 0) {
      res.status(404);
      throw new Error("No valid deliveries found");
    }

    // Calculate total load products and expected sales
    const totalLoadProducts = deliveries.reduce(
      (acc, delivery) => acc + delivery.quantity!,
      0
    );
    const expectedSales = deliveries.reduce(
      (acc, delivery) => acc + delivery.total!,
      0
    );
    const expectedSales_wholesale = deliveries.reduce(
      (acc, delivery) => acc + delivery.wholesale_price_total!,
      0
    );

    // Collect all product IDs from all deliveries
    const productIds = deliveries.flatMap((delivery) =>
      delivery.Products.map((product) => product.id)
    );

    // Create a DriverLoad entry
    const driverLoad = await prisma.driverLoad.create({
      data: {
        driver_id: driverId,
        Product: {
          connect: productIds.map((id) => ({ id })),
        },
        total_load_products: totalLoadProducts,
        expected_sales: expectedSales,
        expected_sales_wholesale: expectedSales_wholesale,
        status: "PENDING",
      },
    });

    successHandler(driverLoad, res, "POST");
  }
);
