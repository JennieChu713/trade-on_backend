import express from "express";

const router = express.Router();

import category from "./modules/category.js";

router.use("/category", category);

export default router;
