import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { successHandler } from "../../Middleware/ErrorHandler";
import { AuthRequest } from "../../Middleware/DriverAuthMiddleware";
import { validateIdParams } from "../../Helpers/validateIdParams";

const prisma = new PrismaClient();

//driver controller
export const getAllDriverSales = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;

    const findSalesDriver = await prisma.driverSales.findMany({
      where: { driver_id: driverId },
      select: {
        Product: { select: { name: true } },
        quantity: true,
        saleType: true,
        sales: true,
        status: true,
        paymentOptions: true,
        paymentStatus: true,
        balance: true,
      },
    });

    successHandler(findSalesDriver, res, "GET");
  }
);
