import User from "../models/user.js";
import ErrorResponse from "../utils/errorResponse.js";

import {
  optionsSetup,
  paginateObject,
} from "../utils/paginateOptionSetup.common.js";

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
}
