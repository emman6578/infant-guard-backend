import { Router } from "express";

import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";
import {
  print,
  update,
  listFileInDownloadsFolder,
  download,
} from "../Controller/PrintController/PrintController";

const router = Router();

router.get("/", authenticateToken, isAdmin, print);
router.post("/", authenticateToken, isAdmin, update);
router.get("/files", authenticateToken, isAdmin, listFileInDownloadsFolder);
router.get("/download/:filename", download);

export default router;
