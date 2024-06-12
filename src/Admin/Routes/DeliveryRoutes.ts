import { Router } from "express";

import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";
import { addToDelivery } from "../Controller/DeliveryController/DeliveryController";

const router = Router();

router.post("/", authenticateToken, isAdmin, addToDelivery);

// router.get("/delivery", authenticateToken, isAdmin, getDelivery);

export default router;
