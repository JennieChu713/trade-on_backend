import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";
import ValidationMiddleware from "../../middleware/validation.js";

const { transactionInvolved, isPostAuthorFromMsg, isUserSelf } =
  AuthenticationMiddleware;
const { idValidate } = ValidationMiddleware;
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
router.post(
  "/message/:id/accept",
  idValidate,
  isPostAuthorFromMsg,
  createTransaction
);

// READ a transaction
router.get("/:id", idValidate, transactionInvolved, getOneTransaction);

// UPDATE transaction - filling sending info and isFilled for other than faceToFace
router.put(
  "/:id/filling-info",
  idValidate,
  transactionInvolved,
  updateFillingProgress
);

// UPDATE account of user
router.put("/user/:id/account-info", idValidate, isUserSelf, updateUserAccount);

// UPDATE transaction - is paid
router.put(
  "/:id/payment",
  idValidate,
  transactionInvolved,
  updatePaymentProgress
);

// UPDATE transaction - is complete
router.put(
  "/:id/complete",
  idValidate,
  transactionInvolved,
  updateCompleteProgress
);

// UPDATE transaction - cancel
router.put("/:id/cancel", idValidate, transactionInvolved, updateCancelTrans);

export default router;
