import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";
import ValidationMiddleware from "../../middleware/validation.js";
import { uploadCheck } from "../../middleware/multer.js";

const { permissionCheck, verifyLogin, checkToken, isUserSelf, isPrimaryAdmin } =
  AuthenticationMiddleware;
const { idValidate } = ValidationMiddleware;

import UserControllers from "../../controllers/users.js";
const {
  register,
  // logout,
  login,
  getAllUsers,
  getUserInfo,
  updateUserInfo,
  deleteUser,
  getMe,
  updateAccountAuth,
  updatePassword,
  updateAvatar,
  getAllRecords,
} = UserControllers;

const router = express.Router();

// READ all users (admin)
router.get("/all", checkToken, permissionCheck, getAllUsers);

// handle LOGIN
router.post("/login", verifyLogin, login);

//handle REGISTER
router.post("/register", register);

//handle LOGOUT
// router.get("/logout", logout);

// GET token user route
router.get("/me", checkToken, getMe);

// READ records
router.get("/:id/record", idValidate, getAllRecords);

// UPDATE password
router.put(
  "/:id/password",
  checkToken,
  idValidate,
  isUserSelf,
  isPrimaryAdmin,
  updatePassword
);

// UPDATE avatarUrl
router.put(
  "/:id/avatar",
  checkToken,
  idValidate,
  isUserSelf,
  uploadCheck.single("imageUrl"),
  updateAvatar
);

// UPDATE userAuthority
router.put(
  "/:id/auth",
  checkToken,
  permissionCheck,
  idValidate,
  isPrimaryAdmin,
  updateAccountAuth
);

// READ userInfo
router.get("/:id", idValidate, getUserInfo);

// UPDATE userInfo
router.put("/:id", checkToken, idValidate, isUserSelf, updateUserInfo);

// DELETE user
router.delete(
  "/:id/delete",
  checkToken,
  idValidate,
  isUserSelf,
  isPrimaryAdmin,
  deleteUser
);

export default router;
