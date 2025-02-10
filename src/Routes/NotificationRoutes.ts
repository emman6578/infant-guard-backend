import { Router } from "express";
import {
  getNotification,
  storeNotification,
} from "../Controller/NotificationController/NotificationController";
import { authenticateToken } from "../Middleware/authMiddleware";

const router = Router();

router.post("/store", authenticateToken, storeNotification);
router.get("/get", authenticateToken, getNotification);

export default router;
