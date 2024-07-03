import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { successHandler } from "../../Middleware/ErrorHandler";

const prisma = new PrismaClient();

export const SalesReport = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const reports = await prisma.salesReport.findMany({
      select: {
        id: true,
        dateAdded: true,
        QuantitySold: true,
        driver: { select: { id: true, fullname: true, email: true } },
        SalesReportProducts: {
          select: {
            Product: {
              select: { name: true, price: true, wholesale_price: true },
            },
            sales: true,
            saleType: true,
            quantity: true,
            paymentOptions: true,
            paymentStatus: true,
            balance: true,
            Customer: { select: { name: true } },
          },
        },
      },
      orderBy: { dateAdded: "desc" },
    });

    // Transform the data
    const transformedReports = reports.map((report) => {
      const totalInRetail = report.SalesReportProducts.filter(
        (product) => product.saleType === "RETAIL"
      ).reduce((acc, product) => acc + product.sales, 0);

      const totalInWholesale = report.SalesReportProducts.filter(
        (product) => product.saleType === "WHOLESALE"
      ).reduce((acc, product) => acc + product.sales, 0);

      const balance = report.SalesReportProducts.reduce(
        (acc, product) => acc + product.balance,
        0
      );

      const quantity = report.SalesReportProducts.reduce(
        (acc, product) => acc + product.quantity!,
        0
      );

      const customer = report.SalesReportProducts.map((cs) => cs.Customer);

      const id = report.id;
      const driver = report.driver;

      return {
        id,
        driver,
        date: report.dateAdded,
        products: report.SalesReportProducts,
        total_in_retail: totalInRetail.toFixed(2),
        total_in_wholesale: totalInWholesale.toFixed(2),
        balance: balance.toFixed(2),
        quantity,
        remainingProducts: report.QuantitySold,
        customer,
      };
    });

    successHandler(transformedReports, res, "GET");
  }
);
