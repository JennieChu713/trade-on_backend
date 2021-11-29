import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";

const { transactionInvolved, isPostAuthor } = AuthenticationMiddleware;
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
router.get("/:id", getOneTransaction);
// router.get("/:id", transactionInvolved, getOneTransaction);

// READ start a deal transaction - step 0: get dealer info and post info for owner
router.get("/post/:id/request", getTransactionDealerAndPost);
// router.get("/post/:id/request", isPostAuthor, getTransactionDealerAndPost);

// CREATE start a deal transaction - step 1 :send from owner (add dealer and postId)
router.post("/post/:id", createRequestTransaction);
// router.post("/post/:id", isPostAuthor, createRequestTransaction);

// READ a request deal transaction info from owner - step 2: get for dealer
router.get("/:id/accept", getTransactionOwnerRequest);
// router.get("/:id/accept", transactionInvolved, getTransactionOwnerRequest);

// UPDATE transaction - filling sending info and isFilled
router.put("/:id/filling-info", updateFillingProgress);
// router.put("/:id/filling-info", transactionInvolved, updateFillingProgress);

// UPDATE account of user
router.put("/user/:id/account-info", updateUserAccount);
// router.put("/user/:id/account-info", updateUserAccount);

// UPDATE transaction - is paid
router.put("/:id/payment", updatePaymentProgress);
// router.put("/:id/payment", transactionInvolved, updatePaymentProgress);

// UPDATE transaction - is sent
router.put("/:id/sendout", updateSendoutProgress);
// router.put("/:id/sendout", transactionInvolved, updateSendoutProgress);

// UPDATE transaction - is complete
router.put("/:id/complete", updateCompleteProgress);
// router.put("/:id/complete", transactionInvolved, updateCompleteProgress);

// UPDATE a deal transaction - step 3: from dealer (add ownerId and dealMethod)
// a transaction deal is confirmed
router.put("/:id", updateAcceptTransaction);
// router.put("/:id", transactionInvolved, updateAcceptTransaction);

export default router;
