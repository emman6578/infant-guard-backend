import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { AuthRequest } from "../../Middleware/authMiddleware";

const prisma = new PrismaClient();

//TODO: Add checkers here

export const storeNotification = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { title, body, data } = req.body;
    const parentId = req.parent?.id;

    const createRecord = await prisma.notification.create({
      data: {
        parentId: parentId,
        title,
        body,
        data,
      },
    });

    successHandler(createRecord, res, "POST");
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
