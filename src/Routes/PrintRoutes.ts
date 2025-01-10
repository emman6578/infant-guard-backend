import { Router } from "express";

import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";
import {
  print,
  update,
  listFileInDownloadsFolder,
  download,
  printBySupplier,
  create,
} from "../Controller/PrintController/PrintController";
import fs from "fs";
import path from "path";
import multer from "multer";

const router = Router();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer to use the uploads directory
const upload = multer({ dest: uploadsDir });

router.get("/", authenticateToken, isAdmin, print);
router.post("/", upload.single("file"), authenticateToken, isAdmin, update);
router.post(
  "/create",
  upload.single("file"),
  authenticateToken,
  isAdmin,
  create
);
router.get("/files", authenticateToken, isAdmin, listFileInDownloadsFolder);
router.get("/download/:filename", download);
//print by supplier
router.get("/supplier", authenticateToken, isAdmin, printBySupplier);

export default router;
