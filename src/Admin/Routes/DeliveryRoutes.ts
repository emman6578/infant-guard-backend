import { Router } from "express";

import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";
import {
  addToDelivery,
  getDeliveries,
  confirmDelivery,
} from "../Controller/DeliveryController/DeliveryController";

const router = Router();

router.post("/", authenticateToken, isAdmin, addToDelivery);
router.get("/", authenticateToken, isAdmin, getDeliveries);
router.post("/confirm", authenticateToken, isAdmin, confirmDelivery);

export default router;
