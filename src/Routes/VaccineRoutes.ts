import { Router } from "express";
import { create } from "../Controller/VaccineController/VaccineController";
import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";
import { vaccineProgressInHTML } from "../Controller/DownloadVaccineProgressController/VaccineProgressController";

const router = Router();

router.post("/", authenticateToken, isAdmin, create);

router.get("/view-progress-in-html", vaccineProgressInHTML);

export default router;
