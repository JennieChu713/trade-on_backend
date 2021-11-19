import express from "express";
import { isTransactionRelated, isPostAuthor } from "../../middleware/auth.js";

import TransactionControllers from "../../controllers/transactions.js";
const {
  getAllTransactions,
  getTransactionDealerAndPost,
  createRequestTransaction,
  getTransactionOwnerRequest,
  updateAcceptTransaction,
  getOneTransaction,
  updateFillingProgress,
  updateUserAccount,
  updatePaymentProgress,
  updateSendoutProgress,
  updateCompleteProgress,
} = TransactionControllers;

const router = express.Router();

// READ all transactions (from a user)
router.get("/all", getAllTransactions);

// READ a transaction
router.get("/:id", isTransactionRelated, getOneTransaction);

// READ start a deal transaction - step 0: get dealer info and post info for owner
router.get("/post/:id/request", isPostAuthor, getTransactionDealerAndPost);

// CREATE start a deal transaction - step 1 :send from owner (add dealer and postId)
router.post("/post/:id", isPostAuthor, createRequestTransaction);

// READ a request deal transaction info from owner - step 2: get for dealer
router.get("/:id/accept", isTransactionRelated, getTransactionOwnerRequest);

// UPDATE transaction - filling sending info and isFilled
router.put("/:id/filling-info", isTransactionRelated, updateFillingProgress);

// UPDATE account of user
router.put("/user/:id/account-info", updateUserAccount);

// UPDATE transaction - is paid
router.put("/:id/payment", isTransactionRelated, updatePaymentProgress);

// UPDATE transaction - is sent
router.put("/:id/sendout", isTransactionRelated, updateSendoutProgress);

// UPDATE transaction - is complete
router.put("/:id/complete", isTransactionRelated, updateCompleteProgress);

// UPDATE a deal transaction - step 3: from dealer (add ownerId and dealMethod)
// a transaction deal is confirmed
router.put("/:id", isTransactionRelated, updateAcceptTransaction);

export default router;
