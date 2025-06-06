import { Router } from "express";

import { authenticateToken } from "../Middleware/authMiddleware";
import {
  conversation,
  create,
  read,
  deleteConversations,
  unreadCount,
  findExpoPushToken,
} from "../Controller/MessageController/MessageController";

const router = Router();

router.post("/", authenticateToken, create);
router.get("/", authenticateToken, conversation);
router.get("/unreadCount", authenticateToken, unreadCount);
router.get("/:conversationId", authenticateToken, read);
router.delete("/", authenticateToken, deleteConversations);
router.post("/pushTokenAdmin/:id", authenticateToken, findExpoPushToken);

export default router;
