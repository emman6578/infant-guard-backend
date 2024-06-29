import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { successHandler } from "../../Middleware/ErrorHandler";
import { AuthRequest } from "../../Middleware/DriverAuthMiddleware";

const prisma = new PrismaClient();

export const getLoggedInDriverSales = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;

    if (!driverId) {
      throw new Error("Driver ID not found in request");
    }

    const findDriverSales = await prisma.driverSales.findMany({
      where: { driver_id: driverId },
    });

    // Calculate the totals
    const totals = findDriverSales.reduce(
      (acc, sale) => {
        if (sale.paymentStatus === "UNPAID") {
          acc.totalUnpaidBalance += sale.balance;
        }
        if (sale.saleType === "RETAIL") {
          acc.totalRetailSales += sale.sales;
        } else if (sale.saleType === "WHOLESALE") {
          acc.totalWholesaleSales += sale.sales;
        }
        acc.totalQuantity += sale.quantity!;

        return acc;
      },
      {
        totalRetailSales: 0,
        totalWholesaleSales: 0,
        totalUnpaidBalance: 0,
        totalQuantity: 0,
      }
    );

    // Format the response
    const response = {
      totals: {
        totalRetailSales: totals.totalRetailSales,
        totalWholesaleSales: totals.totalWholesaleSales,
        totalUnpaidBalance: totals.totalUnpaidBalance,
        totalQuantity: totals.totalQuantity,
      },
    };

    successHandler(response, res, "GET");
  }
);

export const getSalesByDriver = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;

    if (!driverId) {
      throw new Error("Driver ID not found in request");
    }

    const findDriverSales = await prisma.driverSales.findMany({
      where: { driver_id: driverId },
      include: { Customer: true },
    });

    successHandler(findDriverSales, res, "GET");
  }
);
