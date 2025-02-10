import { Router } from "express";
import { create } from "../Controller/VaccineController/VaccineController";
import { authenticateToken } from "../Middleware/authMiddleware";
import { vaccineProgressInHTML } from "../Controller/DownloadVaccineProgressController/VaccineProgressController";

const router = Router();

router.post("/", authenticateToken, create);

router.get("/view-progress-in-html", vaccineProgressInHTML);

export default router;
