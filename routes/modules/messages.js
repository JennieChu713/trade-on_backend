import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";
import ValidationMiddleware from "../../middleware/validation.js";

const {
  checkToken,
  isMessageAuthor,
  messagePermission,
  transactionInvolved,
  permissionCheck,
} = AuthenticationMiddleware;

const { idValidate, tradingOptionsValidate } = ValidationMiddleware;

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
router.get("/post/:id", idValidate, getPostRelatedMessages);

// READ all messages with related transaction
router.get(
  "/deal/:id",
  checkToken,
  transactionInvolved,
  idValidate,
  getTransactionRelatedMessages
);

// CREATE a message (post and transaction)
router.post(
  "/new",
  checkToken,
  messagePermission,
  idValidate,
  tradingOptionsValidate,
  createMessage
);

// CREATE a reply (post and transaction)
router.post("/:id/new", checkToken, messagePermission, idValidate, createReply);

// READ one message (for edit rendering value)
router.get("/:id", checkToken, idValidate, isMessageAuthor, getOneMessage);

// UPDATE message / reply
router.put(
  "/:id",
  checkToken,
  idValidate,
  isMessageAuthor,
  tradingOptionsValidate,
  updateMessage
);

// DELETE message with related replies / single reply
router.delete(
  "/:id",
  checkToken,
  idValidate,
  isMessageAuthor,
  deleteMessageAndRelated
);

export default router;
