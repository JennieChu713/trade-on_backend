import JWT from "jsonwebtoken";
import { config } from "dotenv";

if (process.env.NODE_ENV !== "production") {
  config();
}

import User from "../models/user.js";
import Message from "../models/message.js";
import Post from "../models/post.js";
import Transaction from "../models/transaction.js";
import { optionsSetup, paginateObject } from "../utils/paginateOptionSetup.js";
import { errorResponse } from "../utils/errorMsgs.js";
import ImgurAPIs from "../utils/imgurAPI.js";

const { getImgurToken, uploadToImgur, deleteImage } = ImgurAPIs;

const signToken = (user) => {
  return JWT.sign(
    {
      iss: "tradeon",
      sub: {
        id: user.id,
        accountAuthority: user.accountAuthority,
        imgur: user.imgurToken,
      },
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
      newUser.imgurToken = await getImgurToken();

      const token = signToken(newUser);

      res.status(200).json({ success: true, newUser, token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async login(req, res, next) {
    let preferDealMethods, account, avatarUrl, introduction;
    if (!req.user.preferDealMethods.faceToFace.region) {
      req.user.preferDealMethods.faceToFace = undefined;
    }

    if (!req.user.preferDealMethods.selectedMethods.length) {
      req.user.preferDealMethods.selectedMethods = undefined;
    }
    const { faceToFace, selectedMethods } = req.user.preferDealMethods;

    if (!faceToFace.undefined && !selectedMethods) {
      req.user.preferDealMethods = undefined;
    }

    preferDealMethods = req.user.preferDealMethods;

    if (req.user.account.bankCode) {
      account = req.user.account;
    }

    if (req.user.introduction) {
      introduction = req.user.introduction;
    }

    if (req.user.avatarUrl) {
      avatarUrl = req.user.avatarUrl;
    }

    req.user.imgurToken = await getImgurToken();

    const userInfo = {
      preferDealMethods,
      account,
      introduction,
      email: req.user.email,
      nickname: req.user.nickname,
      id: req.user._id,
      accountAuthority: req.user.accountAuthority,
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
    const options = optionsSetup(
      page,
      size,
      "+accountAuthority +isAllowPost +isAllowMessage"
    );
    const { limit } = options;
    try {
      const getAllUsers = await User.paginate({}, options);
      const { totalDocs, docs, page } = getAllUsers;
      const paginate = paginateObject(totalDocs, limit, page);
      const allUsers = docs;

      for (const user of allUsers) {
        if (!user.preferDealMethods.selectedMethods.length) {
          user.preferDealMethods.selectedMethods = undefined;
        }
      }

      res.status(200).json({ message: "success", paginate, allUsers });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateAccountAuth(req, res, next) {
    const { id } = req.params;
    const { role, isAllowMessage, isAllowPost } = req.body;
    try {
      const user = await User.findByIdAndUpdate(
        id,
        {
          accountAuthority: role,
          isAllowMessage: isAllowMessage ? true : false,
          isAllowPost: isAllowPost ? true : false,
        },
        { runValidators: true, new: true }
      ).select("+isAllowPost +isAllowMessage");

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

      if (!user.preferDealMethods.selectedMethods.length) {
        user.preferDealMethods.selectedMethods = undefined;
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
      tradingOptions, //array contain string
      region,
      district,
      bankCode,
      accountNum,
    } = req.body;

    if (!nickname) {
      errorResponse(res, 400);
      return;
    }

    const blankFields = {};
    const dataStructure = { nickname };

    if (introduction) {
      dataStructure.introduction = introduction;
    } else {
      blankFields.introduction = "";
    }

    if (bankCode && accountNum) {
      dataStructure.account = { accountNum, bankCode };
    } else {
      blankFields.account = "";
    }

    const preferDealMethods = { selectedMethods: [] };
    if (tradingOptions && tradingOptions.length) {
      preferDealMethods.selectedMethods = [...tradingOptions];

      if (tradingOptions.indexOf("面交") > -1 && region && district) {
        preferDealMethods.faceToFace = { region, district };
      } else {
        blankFields.faceToFace = "";
      }
    }

    try {
      const updateUser = await User.findByIdAndUpdate(
        id,
        { ...dataStructure, preferDealMethods, $unset: blankFields },
        {
          runValidators: true,
          new: true,
        }
      );

      if (!updateUser.preferDealMethods.selectedMethods.length) {
        updateUser.preferDealMethods.selectedMethods = undefined;
      }

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
        "+accountAuthority -__v"
      );
      if (!user) {
        errorResponse(res, 404);
        return;
      }

      if (!user.preferDealMethods.selectedMethods.length) {
        user.preferDealMethods.selectedMethods = undefined;
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
      if (oldPassword === newPassword) {
        return res
          .status(403)
          .json({ error: "new password is identical to present password." });
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
    if (!req.file) {
      return res.status(200).json({ message: "no update" });
    }
    const encode_image = req.file.buffer.toString("base64");
    const uploadImgur = {
      image: encode_image,
      album: process.env.IMGUR_ALBUM_USER_ID,
    };

    try {
      const getUser = await User.findById(id).select("+avatarUrl.deleteHash");
      const { deleteHash } = getUser.avatarUrl;

      if (deleteHash) {
        await deleteImage(res.locals.imgurToken, deleteHash);
      }

      const getImgurData = await uploadToImgur(
        res.locals.imgurToken,
        uploadImgur
      );

      const { link, deletehash } = getImgurData;
      getUser.avatarUrl.imgUrl = link;
      getUser.avatarUrl.deleteHash = deletehash;

      const updateUser = await getUser.save();
      updateUser.avatarUrl.deleteHash = undefined;
      res.status(200).json({ message: "success", update: updateUser });
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
        if (filterQuery.isCompleted) {
          filterQuery.owner = id;
        } else {
          filterQuery.author = id;
        }
        break;
      case "take":
        status === "all"
          ? (filterQuery.author = id)
          : (filterQuery.dealer = id);
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

      if (filterQuery.isPublic && filterQuery.author) {
        // all posts as giver general
        getAll = await Post.paginate(filterQuery, options);
      } else if (filterQuery.isCompleted) {
        // all completed deal records (present base on owner/giver or dealer/taker)
        getAll = await Transaction.paginate(filterQuery, options);
      } else if (filterQuery.messageType && filterQuery.author) {
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
