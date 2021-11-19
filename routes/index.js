import express from "express";
import { authenticator } from "../middleware/auth.js";

const router = express.Router();

import commonQA from "./modules/commonQA.js";
import category from "./modules/category.js";
import posts from "./modules/posts.js";
import message from "./modules/messages.js";
import transactions from "./modules/transactions.js";
import users from "./modules/users.js";

router.use("/category", category);
router.use("/posts", posts);
router.use("/transactions", authenticator, transactions);
router.use("/messages", message);
router.use("/commonqnas", commonQA);
router.use("/users", users);

//additional routes present message
router.get("/", (req, res) => {
  res
    .status(200)
    .send(
      "Welcome to tradeon backend. please type-in a desire route to enter."
    );
});

////// reset temp route /////
import { resetting } from "../controllers/reset.js";
// temporary reset seed
router.get("/reset", resetting);

router.get("/*", (req, res) => {
  res.status(404).json({ error: "permission denied or incorrect route." });
});

export default router;
