import express from "express";

const router = express.Router();

import posts from "./modules/posts.js";

router.use("/post", posts);

export default router;
