import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { successHandler } from "../../Middleware/ErrorHandler";
import { AuthRequest } from "../../Middleware/DriverAuthMiddleware";

const prisma = new PrismaClient();

//driver controller
export const getCurrentlyLoggedInDriver = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;

    const allUsers = await prisma.driver.findMany({
      where: { id: driverId },
      include: { DriverLoad: true },
    });

    if (!allUsers) {
      throw new Error("Error Getting currently logged in driver");
    }

    successHandler(allUsers, res, "GET");
  }
);

//must fetch this from the delivery load

export const getDeliveriesbyDriverLoggedin = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driverId = req.driver?.id;
    // Fetch all deliveries for the given admin
    const deliveries = await prisma.driverLoad.findMany({
      where: { driver_id: driverId },
      include: {
        DriverLoadProducts: {
          include: {
            Product: {
              select: { name: true, price: true, wholesale_price: true },
            },
          },
        },
      },
    });

    successHandler(deliveries, res, "GET");
  }
);
