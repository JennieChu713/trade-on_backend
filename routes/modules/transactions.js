import express from "express";
import Transaction from "../../models/transaction.js";
import Post from "../../models/post.js";
import User from "../../models/user.js";
import mongoose from "mongoose";

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

// READ start a deal transaction - step 0: get dealer info and post info for owner
router.get("/post/:id/request", getTransactionDealerAndPost);

// CREATE start a deal transaction - step 1 :send from owner (add dealer and postId)
router.post("/post/:id", createRequestTransaction);

// READ a request deal transaction info from owner - step 2: get for dealer
router.get("/post/:id/accept", getTransactionOwnerRequest);

// UPDATE a deal transaction - step 3: from dealer (add ownerId and dealMethod)
router.put("/post/:id", updateAcceptTransaction);

// READ a transaction
router.get("/:id", getOneTransaction);

// UPDATE transaction - filling sending info and isFilled
router.put("/filling-info/:id", updateFillingProgress);

// UPDATE account of user
router.put("/account-info/:id", updateUserAccount);

// UPDATE transaction - is paid
router.put("/payment/:id", updatePaymentProgress);

// UPDATE transaction - is sent
router.put("/sendout/:id", updateSendoutProgress);

// UPDATE transaction - is complete
router.put("/complete/:id", updateCompleteProgress);

export default router;
