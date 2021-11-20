import User from "../models/user.js";
import Transaction from "../models/transaction.js";
import mongoose from "mongoose";
import ErrorResponse from "../utils/errorResponse.js";

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
      return next(new ErrorResponse("All field(s) required", 400));
    }
    if (password !== confirmPassword) {
      return next(new ErrorResponse("password confirmation failed", 401));
    }

    try {
      const userExist = await User.findOne({ email });
      if (userExist) {
        return next(new ErrorResponse("User already exist"), 401);
      }
      const newUser = await User.create({
        nickname,
        email,
        password,
      });
      res.status(200).json({ message: "success" });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    res.status(200).json({ message: "success" });
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
      next(err);
    }
  }

  static async getUserInfo(req, res, next) {
    const { id } = req.params;
    try {
      const user = await User.findById(id);
      const record = await Transaction.find({
        $or: [{ owner: ObjectId(id) }, { dealer: ObjectId(id) }],
        isCompleted: true,
      });

      if (!user) {
        return res
          .status(404)
          .json({ error: "The user you are looking for does not exist." });
      }
      res.status(200).json({ message: "success", userInfo: user, record });
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
  }
  static async deleteUser(req, res, next) {
    const { id } = req.params;
    if (String(req.user._id) !== id || req.user.accountAuthority !== "admin") {
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
