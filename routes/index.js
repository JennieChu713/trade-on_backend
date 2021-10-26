import express from "express";

const router = express.Router();

import users from "./modules/users.js";
import auth from "./modules/auth.js";

router.use("/users", users);
router.use("/auth", auth);

export default router;
