import express from "express";
import passport from "passport";

import UserControllers from "../../middleware/users.js";
const { register, logout, login } = UserControllers;

const router = express.Router();

// handle LOGIN
router.post("/login", login);

//handle REGISTER
router.post("/register", register);

//handle LOGOUT
router.get("/logout", logout);

export default router;
