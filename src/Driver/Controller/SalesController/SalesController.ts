import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { successHandler } from "../../Middleware/ErrorHandler";
import { AuthRequest } from "../../Middleware/DriverAuthMiddleware";

const prisma = new PrismaClient();

// Driver controller
export const getAllDriverSales = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;

    if (!driverId) {
      throw new Error("Driver ID not found in request");
    }

    // Extract query parameters for filtering, sorting, and pagination
    const {
      page = 1,
      limit = 10,
      sortField = "createdAt",
      sortOrder = "asc",
      paymentOptions,
      paymentStatus,
      minBalance,
    } = req.query;

    // Build the where clause for filtering
    const whereClause: any = {
      driver_id: driverId,
    };

    if (paymentOptions) {
      whereClause.paymentOptions = paymentOptions;
    }

    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus;
    }

    if (minBalance) {
      whereClause.balance = {
        gte: parseFloat(minBalance as string),
      };
    }

    // Calculate the pagination offset
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Fetch the sales data with filtering, sorting, and pagination
    const findSalesDriver = await prisma.driverSales.findMany({
      where: whereClause,
      select: {
        Product: { select: { name: true } },
        quantity: true,
        saleType: true,
        sales: true,
        status: true,
        paymentOptions: true,
        paymentStatus: true,
        balance: true,
        Customer: { select: { name: true, address: true } },
      },
      orderBy: {
        [sortField as string]: sortOrder as string,
      },
      skip: offset,
      take: parseInt(limit as string),
    });

    // Get the total count for pagination
    const totalCount = await prisma.driverSales.count({
      where: whereClause,
    });

    // If no sales found, throw an error
    if (!findSalesDriver) {
      throw new Error("Can't find the sales with the query value");
    }

    // Prepare the response with pagination info
    const response = {
      data: findSalesDriver,
      pagination: {
        total: totalCount,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(totalCount / parseInt(limit as string)),
      },
    };

    successHandler(response, res, "GET");
  }
);

export const getLoggedInDriverSales = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;

    if (!driverId) {
      throw new Error("Driver ID not found in request");
    }

    const findDriverSales = await prisma.driverSales.findMany({
      where: { driver_id: driverId },
    });

    console.log(findDriverSales);

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
