import JWT from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/user.js";
import { optionsSetup, paginateObject } from "../utils/paginateOptionSetup.js";

const { ObjectId } = mongoose.Types;

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
    const { email, nickname, _id, accountAuthority, avatarUrl } = req.user;
    const userInfo = {
      email,
      nickname,
      _id,
      accountAuthority,
      avatarUrl,
    };
    const token = signToken(req.user);
    res.status(200).json({ message: "success", user: userInfo, token });
  }

  static async logout(req, res, next) {
    req.logout();
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

    try {
      const updateUser = await User.findByIdAndUpdate(
        id,
        {
          nickname,
          introduction,
          avatarUrl,
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
    if (res.locals.user !== id) {
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
      const user = await User.findById(res.locals.user).select(
        "-account +accountAuthority -__v"
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

  //TEMPORARY testing route
  static testing(req, res, next) {
    res.status(200).json({
      message: "you can read this message, meaning the token is working",
    });
  }
}
