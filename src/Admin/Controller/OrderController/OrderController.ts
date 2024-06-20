import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import expressAsyncHandler from "express-async-handler";
import { AuthRequest } from "../../Middleware/authMiddleware";
import { successHandler } from "../../Middleware/ErrorHandler";
import { validateIdParams } from "../../Helpers/validateIdParams";

const prisma = new PrismaClient();

export const createOrder = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productInCartIds, address } = req.body;

    // Check if user ID exists
    const adminId = req.admin?.id;
    if (!adminId) {
      throw new Error("User ID is required");
    }

    // Check if productInCartIds is an array
    if (!Array.isArray(productInCartIds)) {
      throw new Error("productInCartIds must be an array");
    }

    // Check if all elements in productInCartIds are valid UUIDs
    if (productInCartIds.some((id: string) => !validateIdParams(id))) {
      throw new Error("productInCartIds contains invalid id");
    }

    // Fetch the productInCart details
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
    const totalWholesalePrice = productInCarts.reduce(
      (acc, item) => acc + item.wholesale_price_total,
      0
    );
    const quantity = productInCarts.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    const status = productInCarts[0].status; // Assuming all items have the same status

    // Get product IDs from ProductInCart items
    const productIds = productInCarts.map((item) => item.product.id);

    // Create new order
    const newOrder = await prisma.order.create({
      data: {
        total,
        wholesale_price_total: totalWholesalePrice,
        payment_status: "PROCESSING", // Default status, can be modified as needed
        quantity,
        status,
        address,
        admin_id: adminId,
        product: {
          connect: productIds.map((id) => ({ id })),
        },
      },
    });

    successHandler(newOrder, res, "POST");
  }
);

export const getOrder = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const adminId = req.admin;

    // Fetch orders for the authenticated user
    const orders = await prisma.order.findMany({
      where: {
        admin_id: adminId?.id,
      },
      include: {
        product: true,
        admin: { select: { fullname: true } },
      },
    });

    // Return the orders in the response
    return successHandler(orders, res, "GET");
  }
);
