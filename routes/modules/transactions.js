import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";

const { transactionInvolved, isPostAuthor } = AuthenticationMiddleware;
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
router.get("/all", getAllTransactions);

// CREATE a transaction
router.post("/message/:id/accept", createTransaction);

// READ a transaction
router.get("/:id", getOneTransaction);
// router.get("/:id", transactionInvolved, getOneTransaction);

// UPDATE transaction - filling sending info and isFilled for other than faceToFace
router.put("/:id/filling-info", updateFillingProgress);
// router.put("/:id/filling-info", transactionInvolved, updateFillingProgress);

// UPDATE account of user
router.put("/user/:id/account-info", updateUserAccount);
// router.put("/user/:id/account-info", updateUserAccount);

// UPDATE transaction - is paid
router.put("/:id/payment", updatePaymentProgress);
// router.put("/:id/payment", transactionInvolved, updatePaymentProgress);

// UPDATE transaction - is complete
router.put("/:id/complete", updateCompleteProgress);
// router.put("/:id/complete", transactionInvolved, updateCompleteProgress);

// UPDATE transaction - cancel
router.put("/:id/cancel", updateCancelTrans);
// router.put("/:id", transactionInvolved, updateCancelTrans);

export default router;
