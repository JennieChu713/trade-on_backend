import express from "express";

const router = express.Router();

import category from "./modules/category.js";
import posts from "./modules/posts.js";
import transactions from "./modules/transactions.js";

router.use("/category", category);
router.use("/posts", posts);
router.use("/transactions", transactions);

export default router;
