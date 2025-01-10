import { Router } from "express";

import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";
import {
  add,
  getCart,
  deleteInCart,
  UpdateCart,
  updateProductInCartQuantity,
} from "../Controller/CartController/CartController";

const router = Router();

router.post("/", authenticateToken, isAdmin, add);
router.get("/", authenticateToken, isAdmin, getCart);
router.put("/", authenticateToken, isAdmin, UpdateCart);
router.put("/:id", authenticateToken, isAdmin, updateProductInCartQuantity);
router.delete("/", authenticateToken, isAdmin, deleteInCart);

export default router;
