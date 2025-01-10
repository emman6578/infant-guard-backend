import { Router } from "express";

import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";
import {
  createOrder,
  getOrder,
} from "../Controller/OrderController/OrderController";

const router = Router();

router.post("/", authenticateToken, isAdmin, createOrder);
router.get("/", authenticateToken, isAdmin, getOrder);

export default router;
