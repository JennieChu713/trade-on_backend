import JWT from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/user.js";
import Message from "../models/message.js";
import Post from "../models/post.js";
import Transaction from "../models/transaction.js";
import { optionsSetup, paginateObject } from "../utils/paginateOptionSetup.js";
import { errorResponse } from "../utils/errorMsgs.js";

const { ObjectId } = mongoose.Types;

const signToken = (user) => {
  return JWT.sign(
    {
      iss: "tradeon",
      sub: { id: user.id, accountAuthority: user.accountAuthority },
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
      errorResponse(res, 400);
      return;
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "password confirmation failed" });
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

      newUser.password = undefined;
      newUser.isAllowPost = undefined;
      newUser.isAllowMessage = undefined;
      newUser.provider = undefined;

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
      id: _id,
      accountAuthority,
      avatarUrl,
    };
    const token = signToken(req.user);
    res.status(200).json({ message: "success", userInfo, token });
  }

  static async logout(req, res, next) {
    if (req.isAuthenticated()) {
      req.logout();
      res.status(200).json({ message: "success" });
    } else {
      res.status(200).json({ message: "already logout" });
    }
  }

  static async getAllUsers(req, res, next) {
    const { page, size } = req.query;
    const options = optionsSetup(page, size, "+accountAuthority");
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

  static async updateAccountRole(req, res, next) {
    const { id } = req.params;
    const { role } = req.body;
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { accountAuthority: role },
        { runValidators: true, new: true }
      );
      if (!user) {
        errorResponse(res, 404);
        return;
      }

      res.status(200).json({ message: "success", updated: user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getUserInfo(req, res, next) {
    const { id } = req.params;
    try {
      const user = await User.findById(id).select("-account");

      if (!user) {
        errorResponse(res, 404);
        return;
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
      accountName,
      bankCode,
      bankName,
      accountNum,
    } = req.body;

    let account;
    if (accountName && bankCode && bankName && accountNum) {
      account = { accountName, accountNum, bankCode, bankName };
    }
    if (!nickname) {
      errorResponse(res, 400);
      return;
    }

    const dataStruct = account
      ? { nickname, introduction, account }
      : { nickname, introduction };

    try {
      const updateUser = await User.findByIdAndUpdate(id, dataStruct, {
        runValidators: true,
        new: true,
      });

      res.status(200).json({ message: "success", update: updateUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteUser(req, res, next) {
    const { id } = req.params;

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
        errorResponse(res, 404);
        return;
      }
      res.status(200).json({ message: "success", userInfo: user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updatePassword(req, res, next) {
    const { id } = req.params;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    try {
      const checkUser = await User.findById(id).select("+password");
      const isMatch = await checkUser.matchPasswords(oldPassword);
      if (!isMatch) {
        return res.status(403).json({ error: "old password does not match." });
      }
      if (newPassword !== confirmNewPassword) {
        return res
          .status(403)
          .json({ error: "new password confirmation failed." });
      }
      checkUser.password = newPassword;
      await checkUser.save();

      res.status(200).json({ message: "success; password changed." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateAvatar(req, res, next) {
    const { id } = req.params;
    const { avatarUrl } = req.body;
    try {
      const user = await User.findByIdAndUpdate(id, avatarUrl, {
        runValidators: true,
        new: true,
      });

      res.status(200).json({ message: success, update: user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getAllRecords(req, res, next) {
    const { id } = req.params;
    const { page, size, type, status } = req.query;

    let filterQuery = {};
    //check whether is general or done deal
    switch (status) {
      case "all":
        if (type === "take") {
          filterQuery.messageType = "apply";
          filterQuery.relatedMsg = { $exists: false };
        } else {
          filterQuery.isPublic = true;
        }
        break;
      case "complete":
        filterQuery.isCompleted = true;
        break;
    }
    //check whether is taker or giver
    switch (type) {
      case "give":
        filterQuery.owner = id;
        break;
      case "take":
        status === "all" ? (filterQuery.owner = id) : (filterQuery.dealer = id);
        break;
    }

    let select;
    if (filterQuery.messageType) {
      // for all applies message as taker
      select = "-content -applyDealMethod -messageType";
    } else if (filterQuery.isCompleted) {
      //for completed records from transaction
      select = "amount -_id";
    } else if (filterQuery.isPublic) {
      //for all post as giver
      select = "id itemName quantity payer isGoal imgUrls category updatedAt";
    }

    // populate setup except giver post
    const populateFields =
      filterQuery.messageType || filterQuery.isCompleted
        ? {
            path: "post",
            select:
              "_id itemName quantity payer isGoal imgUrls category updatedAt",
            model: Post,
          }
        : "";

    const options = optionsSetup(page, size, select, populateFields);
    const { limit } = options;

    try {
      const checkUser = await User.findById(id);
      if (!checkUser) {
        errorResponse(res, 404);
        return;
      }

      let getAll;

      if (filterQuery.isPublic && filterQuery.owner) {
        // all posts as giver general
        getAll = await Post.paginate(filterQuery, options);
      } else if (filterQuery.isCompleted) {
        // all completed deal records (present base on owner/giver or dealer/taker)
        getAll = await Transaction.paginate(filterQuery, options);
      } else if (filterQuery.messageType && filterQuery.owner) {
        // all post as taker general
        getAll = await Message.paginate(filterQuery, options);
      }

      const { totalDocs, docs, page } = getAll;
      const paginate = paginateObject(totalDocs, limit, page);
      const allRelatedPosts = docs;

      res.status(200).json({ message: "success", paginate, allRelatedPosts });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
