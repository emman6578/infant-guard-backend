import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { successHandler } from "../../Middleware/ErrorHandler";

const prisma = new PrismaClient();

//driver controller
export const createCustomer = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const customer = req.body.customer;

    const create = await prisma.customer.create({
      data: {
        name: customer.name,
        address: customer.address,
      },
    });

    if (!create) {
      throw new Error("Error creating customer");
    }

    successHandler(create, res, "GET");
  }
);

export const getCustomers = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const create = await prisma.customer.findMany({});

    if (!create) {
      throw new Error("Error getting customer");
    }

    successHandler(create, res, "GET");
  }
);
