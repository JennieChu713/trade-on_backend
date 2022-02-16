import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";

const {
  checkToken,
  isMessageAuthor,
  messagePermission,
  transactionInvolved,
  permissionCheck,
} = AuthenticationMiddleware;

import MessageControllers from "../../controllers/messages.js";
const {
  getAllMessages,
  getPostRelatedMessages,
  getTransactionRelatedMessages,
  getOneMessage,
  createMessage,
  createReply,
  updateMessage,
  deleteMessageAndRelated,
} = MessageControllers;

const router = express.Router();

// READ all messages (for admin)
router.get("/all", checkToken, permissionCheck, getAllMessages);

// READ all messages of related post
router.get("/post/:id", getPostRelatedMessages);

// READ all messages with related transaction
router.get(
  "/deal/:id",
  checkToken,
  transactionInvolved,
  getTransactionRelatedMessages
);

// CREATE a message (post and transaction)
router.post("/new", checkToken, messagePermission, createMessage);

// CREATE a reply (post and transaction)
router.post("/:id/new", checkToken, messagePermission, createReply);

// READ one message (for edit rendering value)
router.get("/:id", checkToken, isMessageAuthor, getOneMessage);

// UPDATE message / reply
router.put("/:id", checkToken, isMessageAuthor, updateMessage);

// DELETE message with related replies / single reply
router.delete("/:id", checkToken, isMessageAuthor, deleteMessageAndRelated);

export default router;
