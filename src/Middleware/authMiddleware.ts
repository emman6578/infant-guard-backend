import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Parent, PrismaClient } from "@prisma/client";
import expressAsyncHandler from "express-async-handler";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  parent?: Parent;
}

export const authenticateToken = expressAsyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];

    const token = authHeader?.split(" ")[1];
    if (!token) {
      throw new Error("No token attached to header");
    }

    //decode jwt token
    try {
      const payload = (await jwt.verify(token, JWT_SECRET!)) as {
        tokenId: string;
      };
      const dbToken = await prisma.token.findUnique({
        where: { id: payload.tokenId },
        include: { Parent: true },
      });

      if (!dbToken?.valid || dbToken.expiration < new Date()) {
        throw new Error("API token not valid or expired");
      }

      req.parent = dbToken?.Parent!;
    } catch (error) {
      throw new Error("Unathorized");
    }
    next();
  }
);

export const isParent = expressAsyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const parent_id = req.parent?.id;

    const parentUser = await prisma.parent.findUnique({
      where: { id: parent_id },
    });

    if (parentUser!.role !== "Parent") {
      throw new Error("You are not a Parent");
    } else {
      next();
    }
  }
);
