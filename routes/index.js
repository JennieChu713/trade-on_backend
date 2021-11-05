import express from "express";

const router = express.Router();

import message from "./modules/messages.js";

router.use("/messages", message);

export default router;
