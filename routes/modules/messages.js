import express from "express";

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
router.get("/all", getAllMessages);

// READ all messages of related post
router.get("/post/:id", getPostRelatedMessages);

/*
// READ all messages with related transaction
router.get("/deal/:id", getTransactionRelatedMessages);
*/

// READ one message (for edit rendering value)
router.get("/:id", getOneMessage);

// CREATE a message (post and transaction)
router.post("/new", createMessage);

//CREATE a reply (post and transaction)
router.post("/:id/new", createReply);

//UPDATE message / reply
router.put("/:id", updateMessage);

//DELETE message with related replies / single reply
router.delete("/:id", deleteMessageAndRelated);

export default router;
