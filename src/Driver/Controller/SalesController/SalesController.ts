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

    const findDriverSales = await prisma.saleSummary.findMany({
      where: { driver_id: driverId },
    });

    // Calculate the totals
    const totals = findDriverSales.reduce(
      (acc, sale) => {
        if (
          sale.paymentStatus === "UNPAID" ||
          sale.paymentStatus === "PROCESSING"
        ) {
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

    const findDriverSales = await prisma.saleSummary.findMany({
      where: { driver_id: driverId },
      include: { Customer: true, Product: true },
      orderBy: { createdAt: "desc" },
    });

    successHandler(findDriverSales, res, "GET");
  }
);

export const ConfirmSales = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;

    if (!driverId) {
      throw new Error("Driver ID not found in request");
    }

    const totalQuantity = await prisma.driverLoad.findUnique({
      where: { driver_id: driverId },
      select: { total_load_products: true },
    });

    const quantityTotal: number = totalQuantity?.total_load_products!;

    // Retrieve the sales summary for the driver
    const findSaleSummary = await prisma.saleSummary.findMany({
      where: { driver_id: driverId },
      include: { Customer: true, Product: true },
    });

    // Map the sales summary data to the DriverSales model structure
    const driverSalesData = findSaleSummary.map((summary) => ({
      product_id: summary.product_id,
      sales: summary.sales,
      saleType: summary.saleType,
      quantity: summary.quantity,
      status: summary.status,
      paymentOptions: summary.paymentOptions,
      paymentStatus: summary.paymentStatus,
      balance: summary.balance,
      customerId: summary.customerId,
      driver_id: summary.driver_id,
    }));

    // Create new records in the DriverSales model
    await prisma.driverSales.createMany({
      data: driverSalesData,
    });

    // Create a new SalesReport record
    await prisma.salesReport.create({
      data: {
        driver_id: driverId,
        QuantitySold: quantityTotal,
        SalesReportProducts: {
          createMany: {
            data: driverSalesData,
          },
        },
      },
    });

    // Delete the records from the SaleSummary model
    const saleSummaryIds = findSaleSummary.map((summary) => summary.id);
    await prisma.saleSummary.deleteMany({
      where: {
        id: { in: saleSummaryIds },
      },
    });

    successHandler("Successfully confirmed Sales for Today!", res, "POST");
  }
);
