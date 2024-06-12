import { Router } from "express";

import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";
import {
  add,
  getCart,
  deleteInCart,
} from "../Controller/CartController/CartController";

const router = Router();

router.post("/", authenticateToken, isAdmin, add);
router.get("/", authenticateToken, isAdmin, getCart);
router.delete("/", authenticateToken, isAdmin, deleteInCart);

export default router;
