import { Router } from "express";

import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";
import {
  addToDelivery,
  getDeliveries,
  getDrivers,
} from "../Controller/DeliveryController/DeliveryController";

const router = Router();

router.post("/", authenticateToken, isAdmin, addToDelivery);
router.get("/", authenticateToken, isAdmin, getDeliveries);
router.get("/drivers", authenticateToken, isAdmin, getDrivers);

export default router;
