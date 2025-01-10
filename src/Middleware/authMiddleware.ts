import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, PrismaClient } from "@prisma/client";
import expressAsyncHandler from "express-async-handler";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  admin?: User;
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
        include: { User: true },
      });

      if (!dbToken?.valid || dbToken.expiration < new Date()) {
        throw new Error("API token not valid or expired");
      }

      req.admin = dbToken?.User!;
    } catch (error) {
      throw new Error("Unathorized");
    }
    next();
  }
);

export const isAdmin = expressAsyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.admin?.id;

    const adminUser = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (adminUser!.role !== "User") {
      throw new Error("You are not a admin");
    } else {
      next();
    }
  }
);

// export const isDriver = expressAsyncHandler(
//   async (req: AuthRequest, res: Response, next: NextFunction) => {
//     const driver = req.admin?.id;

//     const adminUser = await prisma.admin.findUnique({
//       where: { id: driver },
//     });

//     if (adminUser!.role !== "DRIVER") {
//       throw new Error("You are not a driver");
//     } else {
//       next();
//     }
//   }
// );
