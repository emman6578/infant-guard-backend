import { Router } from "express";

import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";
import {
  addToDelivery,
  getDeliveries,
  // receipt,
} from "../Controller/DeliveryController/DeliveryController";

const router = Router();

router.post("/", authenticateToken, isAdmin, addToDelivery);
router.get("/", authenticateToken, isAdmin, getDeliveries);
// router.get("/receipt", authenticateToken, isAdmin, receipt);

export default router;
