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
    passport.authenticate(
      "local",
      { session: false },
      function (err, user, info) {
        if (err) {
          console.log(err);
          return next(err);
        }
        if (info.message.indexOf("incorrect")) {
          return res.json(info);
        }
        if (!user) {
          return res.json(info);
        }
        req.logIn(user, function (err) {
          if (err) {
            return next(err);
          }
          const { email, nickname, _id, accountAuthority, avatarUrl } =
            req.user;
          const userInfo = {
            email,
            nickname,
            _id,
            accountAuthority,
            avatarUrl,
          };
          const token = signToken(req.user);
          return res.status(200).json({
            message: "success",
            user: userInfo,
            token,
          });
        });
      }
    )(req, res, next);
  }

  static async logout(req, res, next) {
    req.logout();
    res.status(200).json({ message: "success" });
  }
}
