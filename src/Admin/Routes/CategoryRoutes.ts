import { Router } from "express";

import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";
import {
  addCategory,
  deleteCategory,
  getCategory,
  getOneCategory,
} from "../Controller/CategoryController/CategoryController";

const router = Router();

router.post("/", authenticateToken, isAdmin, addCategory);
router.get("/", authenticateToken, isAdmin, getCategory);
router.get("/:id", authenticateToken, isAdmin, getOneCategory);
router.delete("/:id", authenticateToken, isAdmin, deleteCategory);

export default router;
