import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { AuthRequest } from "../../Middleware/authMiddleware";

const prisma = new PrismaClient();

export const vaccineProgressInHTML = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    successHandler(
      "This will display an html file to download by  user the vaccine progress",
      res,
      "GET"
    );
  }
);
