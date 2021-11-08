import express from "express";

const router = express.Router();

import commonQA from "./modules/commonQA.js";
import category from "./modules/category.js";
import posts from "./modules/posts.js";
import message from "./modules/messages.js";
// import transactions from "./modules/transactions.js";

router.use("/category", category);
router.use("/posts", posts);
// router.use("/transactions", transactions);
router.use("/messages", message);
router.use("/commonqnas", commonQA);

export default router;
