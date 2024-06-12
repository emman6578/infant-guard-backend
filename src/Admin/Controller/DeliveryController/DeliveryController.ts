import { PrismaClient, Admin } from "@prisma/client";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { successHandler } from "../../Middleware/ErrorHandler";
import { AuthRequest } from "../../Middleware/authMiddleware";

const prisma = new PrismaClient();

export const addToDelivery = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      driverId,
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

    // Calculate total price and quantity
    const total = productInCarts.reduce((acc, item) => acc + item.total, 0);
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
        quantity,
        admin_id: adminId,
        Products: {
          connect: productIds.map((id) => ({ id })),
        },
        driver_id: driverId,
      },
    });

    successHandler(newDelivery, res, "POST");
  }
);
