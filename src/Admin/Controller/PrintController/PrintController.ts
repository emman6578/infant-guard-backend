import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import expressAsyncHandler from "express-async-handler";
import fs from "fs";
import path from "path";
import {
  generateToken,
  validateToken,
} from "../../../Config/Token/downloadTokenMiddleware";
import { AuthRequest } from "../../Middleware/authMiddleware";

import multer from "multer";
import {
  createExcelFile,
  readExcelFile,
  updateProductsInDatabase,
} from "./Print helpers/printHelper";
import { successHandler } from "../../Middleware/ErrorHandler";

const prisma = new PrismaClient();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer to use the uploads directory
const upload = multer({ dest: uploadsDir });

export const print = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const products = await prisma.product.findMany({
        include: {
          Category: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!products || products.length === 0) {
        throw new Error("Error Getting all Products or Database is empty");
      }

      const directoryPath = path.join(__dirname, "../../../../Download");
      // const filePath = path.join(directoryPath, "products.xlsx");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filePath = path.join(directoryPath, `products_${timestamp}.xlsx`);

      await createExcelFile(products, filePath);

      successHandler("Excel file generated successfully.", res, "GET");
    } catch (error) {
      throw new Error("Error generating Excel file." + error);
    }
  }
);

export const update = [
  upload.single("file"),
  expressAsyncHandler(async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        throw new Error("File not provided.");
      }

      const productsToUpdate = await readExcelFile(file.path);

      await updateProductsInDatabase(productsToUpdate);

      // Delete the uploaded file after processing
      fs.unlink(file.path, (err) => {
        if (err) {
          throw new Error("Error deleting the file:" + err);
        } else {
          console.log("File deleted successfully:", file.path);
        }
      });

      successHandler(
        "Products updated successfully from Excel file.",
        res,
        "POST"
      );
    } catch (error) {
      throw new Error("Error updating products from Excel file." + error);
    }
  }),
];

export const listFileInDownloadsFolder = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const admin = req.admin?.id;

    const generateDownloadToken = generateToken(admin);

    try {
      const directoryPath = path.join(__dirname, "../../../../Download");
      const files = fs.readdirSync(directoryPath);
      const excelFiles = files.filter((file) => file.endsWith(".xlsx"));
      // You can send the list of files as a response
      res
        .status(200)
        .json({ files: excelFiles, downloadToken: generateDownloadToken });
    } catch (error) {
      throw new Error("Error listing files in the download folder." + error);
    }
  }
);

export const download = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const token: any = req.query.token;
      if (!token || !validateToken(token)) {
        throw new Error("Unathorized Download");
      }

      const filePath = path.join(
        __dirname,
        "../../../../Download",
        req.params.filename
      );
      if (!fs.existsSync(filePath)) {
        throw new Error("File not found.");
      }

      res.download(filePath, req.params.filename, (err) => {
        if (err) {
          throw new Error("Problem downloading the file." + err);
        } else {
          // Delete the file after successful download
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              throw new Error("Error deleting the file: " + unlinkErr);
            } else {
              console.log("File deleted successfully: " + filePath);
            }
          });
        }
      });
    } catch (error) {
      throw new Error("Error processing download request." + error);
    }
  }
);

export const printBySupplier = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { supplier } = req.query;

      const products = await prisma.product.findMany({
        where: {
          supplier: supplier ? supplier.toString() : undefined,
        },
        include: {
          Category: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!products || products.length === 0) {
        throw new Error("No products found for the specified supplier.");
      }

      const directoryPath = path.join(__dirname, "../../../../Download");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filePath = path.join(
        directoryPath,
        `products_by_supplier_${timestamp}.xlsx`
      );

      await createExcelFile(products, filePath);

      console.log("Excel file generated successfully.");
      successHandler("Excel file generated successfully.", res, "GET");
    } catch (error) {
      throw new Error("Error generating Excel file." + error);
    }
  }
);
