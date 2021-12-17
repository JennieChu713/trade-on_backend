import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";

const { transactionInvolved, isPostAuthorFromMsg, isUserSelf } =
  AuthenticationMiddleware;
import TransactionControllers from "../../controllers/transactions.js";
const {
  getAllTransactions,
  getOneTransaction,
  updateFillingProgress,
  updateUserAccount,
  updatePaymentProgress,
  updateCompleteProgress,
  updateCancelTrans,
  createTransaction,
} = TransactionControllers;

const router = express.Router();

// READ all transactions (from a user)
router.get("/all", transactionInvolved, getAllTransactions);

// CREATE a transaction
router.post("/message/:id/accept", isPostAuthorFromMsg, createTransaction);

// READ a transaction
router.get("/:id", transactionInvolved, getOneTransaction);

// UPDATE transaction - filling sending info and isFilled for other than faceToFace
router.put("/:id/filling-info", transactionInvolved, updateFillingProgress);

// UPDATE account of user
router.put("/user/:id/account-info", isUserSelf, updateUserAccount);

// UPDATE transaction - is paid
router.put("/:id/payment", transactionInvolved, updatePaymentProgress);

// UPDATE transaction - is complete
router.put("/:id/complete", transactionInvolved, updateCompleteProgress);

// UPDATE transaction - cancel
router.put("/:id/cancel", transactionInvolved, updateCancelTrans);

export default router;
