import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";

const { permissionCheck, verifyLogin, checkToken, isUserSelf } =
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
  updateAccountRole,
  updatePassword,
  getAllRecords,
} = UserControllers;

const router = express.Router();

// get all users (admin)
router.get("/all", getAllUsers);
// router.get("/all", checkToken, permissionCheck, getAllUsers);

// handle LOGIN
router.post("/login", verifyLogin, login);

//handle REGISTER
router.post("/register", register);

//handle LOGOUT
router.get("/logout", logout);

// GET token user route
router.get("/me", checkToken, getMe);

// GET records
router.get("/:id/record", getAllRecords);

// UPDATE password
router.put("/:id/password", checkToken, isUserSelf, updatePassword);

// UPDATE userRole
router.put("/:id/role", checkToken, permissionCheck, updateAccountRole);

// READ userInfo
router.get("/:id", getUserInfo);

// UPDATE userInfo
router.put("/:id", checkToken, isUserSelf, updateUserInfo);

// DELETE user
router.delete("/:id/delete", checkToken, isUserSelf, deleteUser);

export default router;
