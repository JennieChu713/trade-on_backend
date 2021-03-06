import passport from "passport";
import JWT from "jsonwebtoken";
import Post from "../models/post.js";
import Message from "../models/message.js";
import Transaction from "../models/transaction.js";
import User from "../models/user.js";
import Category from "../models/category.js";

import { errorResponse } from "../utils/errorMsgs.js";

export default class AuthenticationMiddleware {
  static async isPostAuthor(req, res, next) {
    const { id } = req.params;
    try {
      const post = await Post.findById(id).select("author").lean();
      if (!post) {
        errorResponse(res, 404);
        return;
      }
      if (!post.author.equals(res.locals.user)) {
        errorResponse(res, 401);
        return;
      }
    } catch (err) {
      next(err);
    }
    next();
  }

  static async isPostAuthorFromMsg(req, res, next) {
    const { id } = req.params;
    try {
      const msg = await Message.findById(id)
        .populate("post")
        .select("author")
        .lean();
      if (!msg) {
        errorResponse(res, 404);
        return;
      }
      if (!msg.post.author.equals(res.locals.user)) {
        errorResponse(res, 401);
        return;
      }
    } catch (err) {
      next(err);
    }
    next();
  }

  static async isMessageAuthor(req, res, next) {
    const { id } = req.params;
    try {
      const message = await Message.findById(id).select("author").lean();
      if (!message) {
        errorResponse(res, 404);
        return;
      }
      if (!message.author.equals(res.locals.user)) {
        errorResponse(res, 401);
        return;
      }
    } catch (err) {
      next(err);
    }
    next();
  }

  static async postPermission(req, res, next) {
    try {
      const checkUser = await User.findById(res.locals.user)
        .select("isAllowPost")
        .lean();
      const { isAllowPost } = checkUser;
      if (!isAllowPost) {
        errorResponse(res, 403);
        return;
      }
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async messagePermission(req, res, next) {
    const { messageType } = req.body;
    if (messageType === "transaction") {
      return next();
    }
    try {
      const checkUser = await User.findById(res.locals.user)
        .select("isAllowMessage")
        .lean();
      const { isAllowMessage } = checkUser;
      if (!isAllowMessage) {
        errorResponse(res, 403);
        return;
      }
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async transactionInvolved(req, res, next) {
    const { id } = req.params;
    try {
      const transaction = id
        ? await Transaction.findById(id).select("owner dealer").lean()
        : await Transaction.findOne({
            $or: [{ owner: res.locals.user }, { dealer: res.locals.user }],
          })
            .select("owner dealer")
            .lean();
      if (!id && !transaction) {
        return next();
      }
      if (
        transaction.owner.equals(res.locals.user) ||
        transaction.dealer.equals(res.locals.user)
      ) {
        return next();
      }

      if (!transaction) {
        errorResponse(res, 404);
        return;
      }

      errorResponse(res, 401);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static permissionCheck(req, res, next) {
    if (res.locals.auth === "admin") {
      return next();
    }
    errorResponse(res, 401);
  }

  static hasQueryUser(req, res, next) {
    const { user, isPublic } = req.query;

    if ((!user && !isPublic) || (!user && isPublic === "true")) {
      return next();
    }
    if (!user && isPublic === "false") {
      errorResponse(res, 401);
      return;
    }

    if (!req.headers.authorization) {
      errorResponse(res, 401);
      return;
    }

    const {
      sub: { id, accountAuthority },
    } = JWT.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_SECRET
    );

    if (accountAuthority === "admin") {
      return next();
    }

    if (!id || user !== id) {
      errorResponse(res, 401);
      return;
    }

    next();
  }

  static hasQueryPublic(req, res, next) {
    const { isPublic } = req.query;

    if (typeof isPublic === "undefined") {
      return next();
    }

    if (isPublic === "false") {
      if (req.headers.authorization.length > 7) {
        return next();
      }
      errorResponse(res, 401);
      return;
    }

    next();
  }

  static async isAdminOrOwner(req, res, next) {
    const { id } = req.params;
    try {
      const post = await Post.findById(id).select("author").lean();
      if (!post) {
        errorResponse(res, 404);
        return;
      }

      if (post.author.equals(res.locals.user) || res.locals.auth === "admin") {
        return next();
      }
    } catch (err) {
      return next(err);
    }
    errorResponse(res, 401);
  }

  static isUserSelf(req, res, next) {
    const { id } = req.params;
    if (res.locals.user !== id) {
      errorResponse(res, 401);
      return;
    }
    next();
  }

  static verifyLogin(req, res, next) {
    passport.authenticate(
      "local",
      { session: false },
      function (err, user, info) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.json(info);
        }
        if (info) {
          return res.json({ error: true, message: info.message });
        }
        req.logIn(user, function (err) {
          if (err) {
            return next(err);
          }
          next();
        });
      }
    )(req, res, next);
  }

  static checkToken(req, res, next) {
    passport.authenticate(
      "jwt",
      { session: false },
      function (err, user, info) {
        if (err) {
          console.log(err);
          return next(err);
        }
        if (info) {
          return res.json({ error: true, message: info.message });
        }

        const token = req.headers.authorization.split(" ")[1];
        const { sub } = JWT.verify(token, process.env.JWT_SECRET);
        res.locals.user = sub.id;
        res.locals.auth = sub.accountAuthority;
        res.locals.imgurToken = sub.imgur;
        next();
      }
    )(req, res, next);
  }

  static async isPrimaryAdmin(req, res, next) {
    const { id } = req.params;
    try {
      let checkUser = await User.findById(id)
        .select("email accountAuthority")
        .lean();
      if (
        checkUser.email.includes("admin") &&
        checkUser.accountAuthority === "admin"
      ) {
        return res.status(403).json({
          message: "this is a primary user, it can not be manipulate.",
        });
      }
      next();
    } catch (err) {
      return next(err);
    }
  }

  static async isPrimaryCategory(req, res, next) {
    const { id } = req.params;
    const { categoryName } = req.body;

    try {
      if (id) {
        let checkCategory = await Category.findById(id).lean();

        if (checkCategory.categoryName === "??????") {
          return res.status(403).json({
            message:
              "forbidden: This is a primary category, it can not be manipulate. - ?????????????????????",
          });
        }
      }
      if (categoryName === "??????") {
        return res.status(403).json({
          message:
            "forbidden: This is a primary category, it can not be manipulate. - ?????????????????????",
        });
      }

      next();
    } catch (err) {
      return next(err);
    }
  }
}
