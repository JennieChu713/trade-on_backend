import express from "express";
import passport from "passport";

import UserControllers from "../../controllers/users.js";
import AuthenticateMiddlewares from "../../middleware/auth.js";
const { register, logout, login, testing } = UserControllers;
const { verifyLogin, checkToken } = AuthenticateMiddlewares;

const router = express.Router();

// handle LOGIN
router.post("/login", verifyLogin, login);

//handle REGISTER
router.post("/register", register);

//handle LOGOUT
router.get("/logout", logout);

//TEMPORARY test token route
router.get("/tokenTest", checkToken, testing);

export default router;
