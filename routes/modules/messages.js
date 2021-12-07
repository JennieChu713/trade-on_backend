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
router.get("/all", getAllMessages);
// router.get("/all", checkToken, permissionCheck, getAllMessages);

// READ all messages of related post
router.get("/post/:id", getPostRelatedMessages);

// READ all messages with related transaction
router.get("/deal/:id", getTransactionRelatedMessages);
// router.get(
//   "/deal/:id",
//   checkToken,
//   transactionInvolved,
//   getTransactionRelatedMessages
// );

// CREATE a message (post and transaction)
router.post("/new", createMessage);
// router.post("/new", checkToken, messagePermission, createMessage);

// READ one message (for edit rendering value)
router.get("/:id", getOneMessage);
// router.get("/:id", checkToken, isMessageAuthor, getOneMessage);

//CREATE a reply (post and transaction)
router.post("/:id/new", createReply);
// router.post("/:id/new", checkToken, messagePermission, createReply);

//UPDATE message / reply
router.put("/:id", updateMessage);
// router.put("/:id", checkToken, isMessageAuthor, updateMessage);

//DELETE message with related replies / single reply
router.delete("/:id", deleteMessageAndRelated);
// router.delete("/:id", checkToken, isMessageAuthor, deleteMessageAndRelated);

export default router;
