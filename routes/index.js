import express from "express";

const router = express.Router();

import category from "./modules/category.js";
import posts from "./modules/posts.js";

router.use("/category", category);
router.use("/post", posts);

export default router;
