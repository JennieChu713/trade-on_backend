import express from "express";
import passport from "passport";
import { authenticator, isAdmin } from "../../middleware/auth.js";

import UserControllers from "../../controllers/users.js";
const { register, logout, login, getAllUsers, getUserInfo, deleteUser } =
  UserControllers;

const router = express.Router();

// get all users (admin)
router.get("/all", authenticator, isAdmin, getAllUsers);

// handle LOGIN
router.post("/login", passport.authenticate("local"), login);

//handle REGISTER
router.post("/register", register);

//handle LOGOUT
router.get("/logout", logout);

// READ userInfo
router.get("/:id", getUserInfo);

// UPDATE userInfo
router.put("/:id", authenticator);

// DELETE user
router.delete("/:id", authenticator, deleteUser);

export default router;
