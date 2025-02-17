import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { AuthRequest } from "../../Middleware/authMiddleware";
import cloudinary from "../../../utils/cloudinary";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const InfantDataToDownload = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const infants = await prisma.infant.findMany({
      include: {
        address: true,
        birthday: true,
        Parent: true,
        Vaccination_Schedule: {
          include: { vaccine_names: true, Vaccination: true },
        },
      },
    });

    successHandler(infants, res, "GET");
  }
);

export const uploadPdfInfant = expressAsyncHandler(
  async (req: Request, res: Response) => {
    console.log("Received file upload request");

    if (!req.file) {
      console.error("No file uploaded");
      throw new Error("No file uploaded");
    }

    const { id } = req.params;
    const file = req.file;

    console.log(`File received: ${file.originalname}, saved at: ${file.path}`);

    // Ensure uploads/pdf directory exists
    const pdfDir = path.join(__dirname, "../../uploads/pdf");
    if (!fs.existsSync(pdfDir)) {
      console.log("uploads/pdf folder does not exist. Creating now...");
      fs.mkdirSync(pdfDir, { recursive: true });
    } else {
      console.log("uploads/pdf folder exists.");
    }

    const localFileName = `${id}.pdf`;

    // Define new file path
    const newFilePath = path.join(pdfDir, localFileName);
    console.log(`Moving file to: ${newFilePath}`);

    // Check if a file with the same name already exists, and if so, remove it
    if (fs.existsSync(newFilePath)) {
      console.log(`File ${newFilePath} already exists. Replacing it.`);
      try {
        fs.unlinkSync(newFilePath);
      } catch (unlinkError) {
        console.error("Error deleting existing file:", unlinkError);
        throw new Error("Failed to remove existing file before replacing it.");
      }
    }

    try {
      fs.renameSync(file.path, newFilePath);
      console.log("File successfully moved.");
    } catch (error) {
      console.error("Error moving file:", error);
      throw new Error("Failed to move file to uploads/pdf");
    }

    successHandler(
      "Database update successful. Sending response...",
      res,
      "POST"
    );
  }
);

//fetch this to front end
export const listOfFileInPdf = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      const directoryPath = path.join(__dirname, "../../uploads/pdf");
      const files = fs.readdirSync(directoryPath);
      const pdfFiles = files.filter((file) => file.endsWith(".pdf"));
      res
        .status(
          200 // You can send the list of files as a response
        )
        .json({ files: pdfFiles });
    } catch (error) {
      throw new Error("Error listing files in the download folder." + error);
    }
  }
);

export const download = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const filePath = path.join(
        __dirname,
        "../../uploads/pdf",
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
