import User from "../models/user.js";
import Transaction from "../models/transaction.js";
import mongoose from "mongoose";

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
          res.status(200).json({ message: "success" });
        });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async login(req, res, next) {
    res.status(200).json({ message: "success" });
  }

  static async logout(req, res, next) {
    req.logout();
    req.session.destroy();
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
}