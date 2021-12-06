import JWT from "jsonwebtoken";

import User from "../models/user.js";

const signToken = (user) => {
  return JWT.sign(
    {
      iss: "tradeon",
      sub: user.id,
      iat: new Date().getTime(),
      exp: new Date().setTime(
        new Date().getTime() + Number(process.env.JWT_EXPIRE)
      ),
    },
    process.env.JWT_SECRET
  );
};

export default class UserControllers {
  static async register(req, res, next) {
    const { email, nickname, password, confirmPassword } = req.body;

    //prevention before storing data
    if (!email || !nickname || !password || !confirmPassword) {
      return res.status(400).json({ error: "All field(s) required" });
    }
    if (password !== confirmPassword) {
      return res.status(403).json({ error: "password confirmation failed" });
    }

    try {
      const userExist = await User.findOne({ email });
      if (userExist) {
        return res.status(403).json({ error: "User already exist" });
      }
      const newUser = await User.create({
        nickname,
        email,
        password,
      });

      const token = signToken(newUser);
      res.status(200).json({ success: true, newUser, token });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    const token = signToken(req.user);
    res.status(200).json({ message: "success", token });
  }

  static async logout(req, res, next) {
    req.logout();
    res.status(200).json({ message: "success" });
  }
}
