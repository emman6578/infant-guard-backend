import { Router } from "express";
import { SalesReport } from "../Controller/SalesReport/SalesReport";
import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";

const router = Router();

router.get("/", authenticateToken, isAdmin, SalesReport);

export default router;
