import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Driver, PrismaClient } from "@prisma/client";
import expressAsyncHandler from "express-async-handler";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  driver?: Driver;
}

export const driverAuthenticateToken = expressAsyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      throw new Error("No token attached to header");
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET!) as { tokenId: string };

      const dbToken = await prisma.token.findUnique({
        where: { id: payload.tokenId },
        include: { Driver: true },
      });

      if (!dbToken || !dbToken.valid || dbToken.expiration < new Date()) {
        throw new Error("API token not valid or expired");
      }

      if (!dbToken.driverId) {
        throw new Error("Driver ID is null");
      }

      const driver = await prisma.driver.findUnique({
        where: { id: dbToken.driverId },
      });

      if (!driver) {
        throw new Error("Driver not found");
      }

      req.driver = driver;
    } catch (error) {
      throw new Error("Unauthorized");
    }

    next();
  }
);
