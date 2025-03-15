import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { AuthRequest } from "../../Middleware/authMiddleware";

const prisma = new PrismaClient();

// export const create = expressAsyncHandler(
//   async (req: AuthRequest, res: Response) => {
//     const { conversationId, text, targetParentId } = req.body;
//     const sender = req.parent;
//     if (!sender) {
//       res.status(401);
//       throw new Error("Unauthorized");
//     }

//     let conversation;

//     if (sender.role === "Parent") {
//       // Parent flow: try to reuse an existing conversation that includes all Admins.
//       if (conversationId) {
//         conversation = await prisma.conversation.findUnique({
//           where: { id: conversationId },
//           include: { participants: true },
//         });
//       } else {
//         // Fetch all Admins.
//         const admins = await prisma.parent.findMany({
//           where: { role: "Admin" },
//         });
//         const adminIds = admins.map((admin) => admin.id);

//         // Find all conversations that include the current Parent.
//         const parentConversations = await prisma.conversation.findMany({
//           where: {
//             participants: { some: { id: sender.id } },
//           },
//           include: { participants: true },
//         });

//         // Look for a conversation that already includes all Admins.
//         conversation = parentConversations.find((conv) => {
//           const participantIds = conv.participants.map((p) => p.id);
//           return adminIds.every((adminId) => participantIds.includes(adminId));
//         });

//         if (!conversation) {
//           // If not found, create a new conversation with Parent and all Admins.
//           conversation = await prisma.conversation.create({
//             data: {
//               participants: {
//                 connect: [{ id: sender.id }, ...adminIds.map((id) => ({ id }))],
//               },
//             },
//             include: { participants: true },
//           });
//         } else {
//           // Ensure the conversation has all Admins (in case some were added later).
//           const participantIds = conversation.participants.map((p) => p.id);
//           const missingAdmins = adminIds.filter(
//             (adminId) => !participantIds.includes(adminId)
//           );
//           if (missingAdmins.length > 0) {
//             conversation = await prisma.conversation.update({
//               where: { id: conversation.id },
//               data: {
//                 participants: {
//                   connect: missingAdmins.map((id) => ({ id })),
//                 },
//               },
//               include: { participants: true },
//             });
//           }
//         }
//       }
//     } else if (sender.role === "Admin") {
//       // For Admins, a targetParentId is required.
//       if (!targetParentId) {
//         res.status(400);
//         throw new Error("targetParentId is required for admin messages");
//       }

//       if (conversationId) {
//         // If conversationId is provided, fetch and validate the conversation.
//         conversation = await prisma.conversation.findUnique({
//           where: { id: conversationId },
//           include: { participants: true },
//         });
//         if (!conversation) {
//           res.status(404);
//           throw new Error("Conversation not found");
//         }
//         // Verify the conversation includes both the Admin and the target Parent.
//         const hasAdmin = conversation.participants.some(
//           (participant) => participant.id === sender.id
//         );
//         const hasTarget = conversation.participants.some(
//           (participant) => participant.id === targetParentId
//         );
//         if (!hasAdmin || !hasTarget) {
//           res.status(403);
//           throw new Error(
//             "Not authorized to send message in this conversation. Ensure both you and the target parent are participants."
//           );
//         }
//       } else {
//         // If no conversationId is provided, look for an existing conversation between the Admin and target Parent.
//         conversation = await prisma.conversation.findFirst({
//           where: {
//             AND: [
//               { participants: { some: { id: sender.id } } },
//               { participants: { some: { id: targetParentId } } },
//             ],
//           },
//           include: { participants: true },
//         });

//         if (!conversation) {
//           // No existing conversation found, so create a new one.
//           conversation = await prisma.conversation.create({
//             data: {
//               participants: {
//                 connect: [{ id: sender.id }, { id: targetParentId }],
//               },
//             },
//             include: { participants: true },
//           });
//         }
//       }
//     } else {
//       res.status(403);
//       throw new Error("Invalid user role");
//     }

//     // Create the message and associate it with the conversation and sender.
//     const message = await prisma.message.create({
//       data: {
//         conversation: { connect: { id: conversation!.id } },
//         sender: { connect: { id: sender.id } },
//         text,
//       },
//     });

//     // Optionally update the conversation's "updated" timestamp.
//     await prisma.conversation.update({
//       where: { id: conversation!.id },
//       data: { updated: new Date() },
//     });

//     successHandler({ message }, res, "POST");
//   }
// );

export const conversation = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.parent;
    if (!user) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    // Fetch conversations with participants and just the read field for messages.
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: user.id },
        },
      },
      include: {
        participants: true,
        messages: {
          select: { read: true },
        },
      },
    });

    // Map the conversations to include a title and unreadCount
    const simplifiedConversations = conversations.map((conversation) => {
      // Compute unread count based on messages with read === false
      const unreadCount = conversation.messages.filter((m) => !m.read).length;

      let title: string;
      if (user.role === "Parent") {
        title = "Ligao City Infant Vaccination";
      } else if (user.role === "Admin") {
        const parentParticipant = conversation.participants.find(
          (participant) => participant.role === "Parent"
        );
        title = parentParticipant
          ? parentParticipant.fullname
          : "Deleted Parent";
      } else {
        title = "Conversation";
      }
      return {
        id: conversation.id,
        title,
        unreadCount,
      };
    });

    successHandler({ conversations: simplifiedConversations }, res, "GET");
  }
);

// Read all messages from a conversation
export const read = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Get conversationId from query (or change to req.params as needed)
    const { conversationId } = req.params;

    const role = req.parent?.role;

    if (typeof conversationId !== "string") {
      res.status(400);
      throw new Error("Invalid conversationId");
    }

    // Ensure the conversation exists and that the user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation) {
      res.status(404);
      throw new Error("Conversation not found");
    }

    const senderId = req.parent?.id;
    const isParticipant = conversation.participants.some(
      (participant) => participant.id === senderId
    );

    if (!isParticipant) {
      res.status(403);
      throw new Error("Not authorized to view this conversation");
    }

    if (role === "Admin") {
      // Update all messages in the conversation to mark them as read
      await prisma.message.updateMany({
        where: { conversationId, read: false },
        data: { read: true },
      });
    }

    // Retrieve all messages for the conversation in ascending order
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { created: "asc" },
      include: { sender: true }, // Optionally include sender details
    });

    successHandler({ messages }, res, "GET");
  }
);

// Remove a message (only if the authenticated parent is the sender)
export const deleteConversations = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Expect an array of conversation IDs in the request body
    const { conversationIds } = req.body;

    if (!conversationIds || !Array.isArray(conversationIds)) {
      res.status(400);
      throw new Error("conversationIds must be an array of conversation IDs");
    }

    // Use deleteMany to remove the conversations
    // The onDelete: Cascade set on Message ensures that related messages are deleted automatically
    const result = await prisma.conversation.deleteMany({
      where: {
        id: {
          in: conversationIds,
        },
      },
    });

    successHandler(
      { message: "Conversations deleted", count: result.count },
      res,
      "DELETE"
    );
  }
);

export const unreadCount = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const conversations = await prisma.conversation.findMany({
      include: {
        participants: true,
        messages: {
          select: { read: true },
        },
      },
    });

    // Sum up unread counts across all conversations
    const totalUnreadCount = conversations.reduce((sum, conversation) => {
      const count = conversation.messages.filter((m) => !m.read).length;
      return sum + count;
    }, 0);

    // Return a single JSON object with the total unread count
    res.json({ unreadCount: totalUnreadCount });
  }
);

export const findExpoPushToken = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const { title, body, data } = req.body;

    const findPushToken = await prisma.parent.findUnique({
      where: { id },
      select: { pushToken: true },
    });

    // Extract the pushToken from the nested Parent object
    const pushToken = findPushToken?.pushToken || null;

    try {
      const notificationData = {
        to: pushToken,
        title,
        body,
        data: { data },
      };

      const response = await fetch(`https://exp.host/--/api/v2/push/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(notificationData),
      });

      successHandler("Successful", res, "GET");
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

export const create = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { conversationId, text, targetParentId } = req.body;
    const sender = req.parent;
    if (!sender) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    let conversation;

    if (sender.role === "Parent") {
      // For a Parent, always use the unique conversation with all Admins.
      // Even if conversationId is provided, ignore it and use this unique conversation.
      const admins = await prisma.parent.findMany({
        where: { role: "Admin" },
      });
      const adminIds = admins.map((admin) => admin.id);

      // Retrieve all conversations the Parent is part of.
      const parentConversations = await prisma.conversation.findMany({
        where: {
          participants: { some: { id: sender.id } },
        },
        include: { participants: true },
      });

      // Look for an existing conversation that includes all Admins.
      conversation = parentConversations.find((conv) => {
        const participantIds = conv.participants.map((p) => p.id);
        return adminIds.every((adminId) => participantIds.includes(adminId));
      });

      if (!conversation) {
        // No conversation exists: create a new one connecting the Parent with all Admins.
        conversation = await prisma.conversation.create({
          data: {
            participants: {
              connect: [{ id: sender.id }, ...adminIds.map((id) => ({ id }))],
            },
          },
          include: { participants: true },
        });
      } else {
        // If found, ensure that all Admins are connected (in case some were added later).
        const participantIds = conversation.participants.map((p) => p.id);
        const missingAdmins = adminIds.filter(
          (adminId) => !participantIds.includes(adminId)
        );
        if (missingAdmins.length > 0) {
          conversation = await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
              participants: {
                connect: missingAdmins.map((id) => ({ id })),
              },
            },
            include: { participants: true },
          });
        }
      }
    } else if (sender.role === "Admin") {
      // For Admins, a targetParentId is required.
      if (!targetParentId) {
        res.status(400);
        throw new Error("targetParentId is required for admin messages");
      }

      if (conversationId) {
        // If conversationId is provided, fetch and validate the conversation.
        conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { participants: true },
        });
        if (!conversation) {
          res.status(404);
          throw new Error("Conversation not found");
        }
        // Validate that both the Admin (sender) and the target Parent are participants.
        const hasAdmin = conversation.participants.some(
          (participant) => participant.id === sender.id
        );
        const hasTarget = conversation.participants.some(
          (participant) => participant.id === targetParentId
        );
        if (!hasAdmin || !hasTarget) {
          res.status(403);
          throw new Error(
            "Not authorized to send message in this conversation. Ensure both you and the target parent are participants."
          );
        }
      } else {
        // Look for an existing conversation between the Admin and the target Parent.
        conversation = await prisma.conversation.findFirst({
          where: {
            AND: [
              { participants: { some: { id: sender.id } } },
              { participants: { some: { id: targetParentId } } },
            ],
          },
          include: { participants: true },
        });

        if (!conversation) {
          // If no conversation exists, create a new one connecting the Admin and the target Parent.
          conversation = await prisma.conversation.create({
            data: {
              participants: {
                connect: [{ id: sender.id }, { id: targetParentId }],
              },
            },
            include: { participants: true },
          });
        }
      }
    } else {
      res.status(403);
      throw new Error("Invalid user role");
    }

    // Create the message and link it to the conversation and sender.
    const message = await prisma.message.create({
      data: {
        conversation: { connect: { id: conversation!.id } },
        sender: { connect: { id: sender.id } },
        text,
      },
    });

    // Update the conversation's timestamp.
    await prisma.conversation.update({
      where: { id: conversation!.id },
      data: { updated: new Date() },
    });

    successHandler({ message }, res, "POST");
  }
);
