import express from "express";
import {
  authenticator,
  isMessageAuthor,
  isMessagePermitted,
  isAdmin,
  isTransactionRelated,
} from "../../middleware/auth.js";

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
router.get("/all", authenticator, isAdmin, getAllMessages);

// READ all messages of related post
router.get("/post/:id", getPostRelatedMessages);

// READ all messages with related transaction
router.get(
  "/deal/:id",
  authenticator,
  isTransactionRelated,
  getTransactionRelatedMessages
);

// READ one message (for edit rendering value)
router.get("/:id", authenticator, isMessageAuthor, getOneMessage);

// CREATE a message (post and transaction)
router.post("/new", authenticator, isMessagePermitted, createMessage);

//CREATE a reply (post and transaction)
router.post("/:id/new", authenticator, isMessagePermitted, createReply);

//UPDATE message / reply
router.put("/:id", authenticator, isMessageAuthor, updateMessage);

//DELETE message with related replies / single reply
router.delete("/:id", authenticator, isMessageAuthor, deleteMessageAndRelated);

export default router;
