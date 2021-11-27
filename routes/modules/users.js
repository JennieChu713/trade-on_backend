import express from "express";
import passport from "passport";
import AuthenticationMiddleware from "../../middleware/auth.js";

const { authenticator, permissionCheck } = AuthenticationMiddleware;

import UserControllers from "../../controllers/users.js";
const {
  register,
  logout,
  login,
  getAllUsers,
  getUserInfo,
  updateUserInfo,
  deleteUser,
  getMe,
} = UserControllers;

const router = express.Router();

// get all users (admin)
router.get("/all", authenticator, permissionCheck, getAllUsers);

// handle LOGIN
router.post("/login", passport.authenticate("local"), login);

//handle REGISTER
router.post("/register", register);

//handle LOGOUT
router.get("/logout", logout);

// get cookie route
router.get("/me", authenticator, getMe);

// READ userInfo
router.get("/:id", getUserInfo);

// UPDATE userInfo
router.put("/:id", authenticator, updateUserInfo);

// DELETE user
router.delete("/:id/delete", authenticator, deleteUser);

export default router;
