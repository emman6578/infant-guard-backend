import { Router } from "express";
import { create } from "../Controller/ParentController/ParentController";
import { authenticateToken } from "../Middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, create);

export default router;
