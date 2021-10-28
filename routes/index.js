import express from "express";

const router = express.Router();

import transactions from "./modules/transactions.js";

router.use("/transactions", transactions);

export default router;
