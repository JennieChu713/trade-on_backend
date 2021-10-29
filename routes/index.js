import express from "express";

const router = express.Router();

import message from "./modules/messages.js";

router.use("/message", message);

export default router;
