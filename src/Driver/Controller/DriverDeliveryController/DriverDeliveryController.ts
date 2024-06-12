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
    });

    if (!allUsers) {
      throw new Error("Error Getting currently logged in driver");
    }

    successHandler(allUsers, res, "GET");
  }
);

// export const ViewDelivery = expressAsyncHandler(
//   async (req: AuthRequest, res: Response) => {
//     const driverId = req.driver?.id;

//     const delivery = await prisma.delivery.findMany({
//       where: { driver_id: driverId },
//       include: {
//         Products: {
//           include: { product: { include: { Product_Info: true } } },
//         },
//         driver: true,
//       },
//     });

//     if (!delivery) {
//       throw new Error(`Error Getting Delivery`);
//     }

//     successHandler(delivery, res, "GET");
//   }
// );

export const ApprovedInventory = expressAsyncHandler(
  async (req: Request, res: Response) => {}
);
