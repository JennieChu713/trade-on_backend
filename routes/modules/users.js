import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";

const { authenticator, permissionCheck, verifyLogin, checkToken } =
  AuthenticationMiddleware;

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
  testing,
} = UserControllers;

const router = express.Router();

// get all users (admin)
router.get("/all", authenticator, permissionCheck, getAllUsers);

// handle LOGIN
router.post("/login", verifyLogin, login);

//handle REGISTER
router.post("/register", register);

//handle LOGOUT
router.get("/logout", logout);

// get cookie route
router.get("/me", checkToken, getMe);

// READ userInfo
router.get("/:id", getUserInfo);

// UPDATE userInfo
router.put("/:id", checkToken, updateUserInfo);

// DELETE user
router.delete("/:id/delete", checkToken, deleteUser);

//TEMPORARY test token route
router.get("/tokenTest", checkToken, testing);

export default router;
