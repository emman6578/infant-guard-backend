import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { AuthRequest } from "../../Middleware/authMiddleware";

const prisma = new PrismaClient();

export const parentList = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const parents = await prisma.parent.findMany({
      where: { role: "Parent" },
      include: { auth: { select: { id: true, email: true } }, address: true },
    });

    successHandler(parents, res, "GET");
  }
);

export const deleteParent = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const deleteParent = await prisma.parent.delete({
      where: { id },
    });

    successHandler("Deleted Parent Successfully....", res, "DELETE");
  }
);

// In your parent controller
export const updateParent = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { fullname, contact_number, address, auth } = req.body;

    const updatedParent = await prisma.parent.update({
      where: { id },
      data: {
        fullname,
        contact_number,
        address: {
          update: address,
        },
        auth: {
          update: auth,
        },
      },
      include: {
        auth: true,
        address: true,
      },
    });

    successHandler(updatedParent, res, "PUT");
  }
);
