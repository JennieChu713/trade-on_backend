import express from "express";

const router = express.Router();

import commonQA from "./modules/commonQA.js";
import category from "./modules/category.js";
import posts from "./modules/posts.js";
import message from "./modules/messages.js";
import transactions from "./modules/transactions.js";

router.use("/category", category);
router.use("/posts", posts);
router.use("/transactions", transactions);
router.use("/messages", message);
router.use("/commonqnas", commonQA);

//additional routes present message
router.get("/", (req, res) => {
  res
    .status(200)
    .send(
      "Welcome to tradeon backend. please type-in a desire route to enter."
    );
});
router.get("/*", (req, res) => {
  res.status(404).json({ error: "permission denied or incorrect route." });
});

export default router;
