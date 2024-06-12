import { Router } from "express";
import {
  addProduct,
  getProducts,
  getProduct,
  updateProductInfo,
  deleteProduct,
} from "../Controller/ProductController/ProductController";
import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, isAdmin, addProduct);
router.get("/", authenticateToken, isAdmin, getProducts);
router.get("/:id", authenticateToken, isAdmin, getProduct);
router.put("/:id", authenticateToken, isAdmin, updateProductInfo);
router.delete("/:id", authenticateToken, isAdmin, deleteProduct);

export default router;
