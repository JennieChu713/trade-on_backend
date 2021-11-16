import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import User from "../../models/user.js";

import UserControllers from "../../middleware/users.js";
const { register, logout } = UserControllers;

const router = express.Router();

// handle LOGIN
router.post("/login", passport.authenticate("local"), async (req, res) => {
  res.status(200).json({ message: "success" });
});

//handle REGISTER
router.post("/register", register);

//handle LOGOUT
router.get("/logout", logout);

export default router;
