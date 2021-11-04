import express from "express";

const router = express.Router();

import commonQA from "./modules/commonQA.js";

router.use("/commonqna", commonQA);

export default router;
