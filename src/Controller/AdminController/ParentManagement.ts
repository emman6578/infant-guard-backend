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

    try {
      // Find all infants associated with the parent
      const infants = await prisma.infant.findMany({
        where: { parent_id: id },
        select: { id: true },
      });

      const infantIds = infants.map((infant) => infant.id);

      if (infantIds.length > 0) {
        // Delete Vaccination records associated with infants
        await prisma.vaccination.deleteMany({
          where: {
            vaccination_schedule: {
              infant: { some: { id: { in: infantIds } } },
            },
          },
        });

        // Delete Vaccination_Schedule records associated with infants
        await prisma.vaccination_Schedule.deleteMany({
          where: { infant: { some: { id: { in: infantIds } } } },
        });

        // Delete Infants associated with the Parent
        await prisma.infant.deleteMany({
          where: { parent_id: id },
        });
      }

      // Delete the Parent
      await prisma.parent.delete({
        where: { id },
      });

      successHandler(
        "Deleted Parent and associated records successfully.",
        res,
        "DELETE"
      );
    } catch (error) {
      throw new Error("Failed to delete Parent" + error);
    }
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
