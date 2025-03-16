import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { AuthRequest } from "../../Middleware/authMiddleware";

const prisma = new PrismaClient();

//TODO: Add checkers here

// export const storeNotification = expressAsyncHandler(
//   async (req: AuthRequest, res: Response) => {
//     const { title, body, data } = req.body;
//     const parentId = req.parent?.id;

//     const createRecord = await prisma.notification.create({
//       data: {
//         parentId: parentId,
//         title,
//         body,
//         data,
//       },
//     });

//     successHandler(createRecord, res, "POST");
//   }
// );

export const storeNotification = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { title, body, data } = req.body;
    const parentId = req.parent?.id;

    const existingNotification = await prisma.notification.findFirst({
      where: {
        parentId,
        title,
      },
    });

    let notification;
    if (existingNotification) {
      // Update existing notification
      notification = await prisma.notification.update({
        where: { id: existingNotification.id },
        data: { body, data, updated: new Date() },
      });
    } else {
      // Create new notification
      notification = await prisma.notification.create({
        data: { parentId, title, body, data },
      });
    }

    successHandler(notification, res, existingNotification ? "UPDATE" : "POST");
  }
);

export const getNotification = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const parentId = req.parent?.id;

    const getRecord = await prisma.notification.findMany({
      where: { parentId },
    });
    successHandler(getRecord, res, "POST");
  }
);
