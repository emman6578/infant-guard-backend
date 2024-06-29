import { Router } from "express";

import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";
import {
  addToDelivery,
  getAllSales,
  getDeliveries,
  getDrivers,
  driverSales,
  getAllTotalSales,
} from "../Controller/DeliveryController/DeliveryController";

const router = Router();

router.post("/", authenticateToken, isAdmin, addToDelivery);
router.get("/", authenticateToken, isAdmin, getDeliveries);
router.get("/drivers", authenticateToken, isAdmin, getDrivers);
router.get("/sales", authenticateToken, isAdmin, getAllSales);
router.get("/total", authenticateToken, isAdmin, getAllTotalSales);
router.get("/:id", authenticateToken, isAdmin, driverSales);

export default router;
