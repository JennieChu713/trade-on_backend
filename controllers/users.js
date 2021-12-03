import User from "../models/user.js";
import mongoose from "mongoose";
import passport from "passport";

import {
  optionsSetup,
  paginateObject,
} from "../utils/paginateOptionSetup.common.js";

const { ObjectId } = mongoose.Types;

export default class UserControllers {
  static async register(req, res, next) {
    const { email, nickname, password, confirmPassword } = req.body;

    //prevention before storing data
    if (!email || !nickname || !password || !confirmPassword) {
      return res.status(400).json({ error: "All field(s) required" });
    }
    if (password !== confirmPassword) {
      return res.status(401).json({ error: "password confirmation failed" });
    }

    try {
      const userExist = await User.findOne({ email });
      if (userExist) {
        return res.status(401).json({ error: "User already exist" });
      }
      const newUser = await User.create({
        nickname,
        email,
        password,
      });
      if (newUser) {
        req.logIn(newUser, function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          const { email, nickname, _id, accountAuthority, avatarUrl } = newUser;
          const userInfo = {
            email,
            nickname,
            _id,
            accountAuthority,
            avatarUrl,
          };

          res.status(200).json({
            message: "success",
            user: userInfo,
          });
        });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async login(req, res, next) {
    passport.authenticate("local", function (err, user, info) {
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
        const { email, nickname, _id, accountAuthority, avatarUrl } = req.user;
        const userInfo = {
          email,
          nickname,
          _id,
          accountAuthority,
          avatarUrl,
        };
        return res.status(200).json({
          message: "success",
          user: userInfo,
        });
      });
    })(req, res, next);
  }

  static async logout(req, res, next) {
    req.logout();
    req.session.destroy();
    if (req.cookies) {
      for (let key in req.cookies) {
        res.clearCookie(`${key}`);
      }
    }
    res.status(200).json({ message: "success" });
  }

  static async getAllUsers(req, res, next) {
    const { page, size } = req.query;
    const options = optionsSetup(page, size);
    const { limit } = options;
    try {
      const getAllUsers = await User.paginate({}, options);
      const { totalDocs, docs, page } = getAllUsers;
      const paginate = paginateObject(totalDocs, limit, page);
      const allUsers = docs;
      res.status(200).json({ message: "success", paginate, allUsers });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getUserInfo(req, res, next) {
    const { id } = req.params;
    try {
      const user = await User.findById(id).select("-account");

      if (!user) {
        return res
          .status(404)
          .json({ error: "The user you are looking for does not exist." });
      }
      res.status(200).json({ message: "success", userInfo: user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateUserInfo(req, res, next) {
    const { id } = req.params;
    const {
      nickname,
      introduction,
      avatarUrl,
      accountName,
      bankCode,
      bankName,
      accountNum,
    } = req.body;

    const account = { accountName, accountNum, bankCode, bankName };
    if (!nickname) {
      return res.status(400).json({ message: "nickname is required" });
    }
    let onlyImgUrl = "";
    if (typeof avatarUrl === "object") {
      const {
        data: { link },
      } = avatarUrl;

      onlyImgUrl = link;
    }
    if (typeof avatarUrl === "string" && avatarUrl.length) {
      const jsonfied = JSON.parse(avatarUrl);
      onlyImgUrl = jsonfied.data.link;
    }
    try {
      const updateUser = await User.findByIdAndUpdate(
        id,
        {
          nickname,
          introduction,
          avatarUrl: onlyImgUrl,
          account,
        },
        { runValidators: true, new: true }
      );

      res.status(200).json({ message: "success", update: updateUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteUser(req, res, next) {
    const { id } = req.params;
    if (String(res.locals.user._id) !== id) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    try {
      await User.findByIdAndDelete(id);
      res.status(200).json({ message: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await User.findById(res.locals.user._id).select(
        "-account +accountAuthority"
      );

      if (!user) {
        return res
          .status(404)
          .json({ error: "The user you are looking for does not exist." });
      }
      res.status(200).json({ message: "success", userInfo: user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
