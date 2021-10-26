import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import User from "../../models/user.js";

const router = express.Router();

// handle LOGIN
router.post("/login", passport.authenticate("local"), async (req, res) => {
  res.status(200).json({ message: "success" });
});

//handle REGISTER
router.post("/register", async (req, res) => {
  const { email, name, password, confirmPassword } = req.body;
  const errors = [];

  //prevention before storing data
  if (!email || !name || !password || !confirmPassword) {
    errors.push({ message: "All field(s) required" });
  }
  if (password !== confirmPassword) {
    errors.push({ message: "Incompatible password confirmation" });
  }
  if (errors.length) {
    return res.status(200).json({
      email: email,
      name: name,
      password: password,
      confirmPassword: confirmPassword,
      errMsgs: errors,
    });
  }
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      errors.push({ message: "Email already registered." });
      return res.status(200).json({
        name: name,
        password: password,
        confirmPassword: confirmPassword,
        errMsgs: errors,
      });
    }
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashed,
    });
    if (newUser) {
      res.status(200).json(newUser);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//handle LOGOUT
router.get("/logout", (req, res) => {
  req.logout();
  res.status(200).json({ message: "success" });
});

export default router;
