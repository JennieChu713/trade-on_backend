import passport from "passport";
import JWT from "jsonwebtoken";
import Post from "../models/post.js";
import Message from "../models/message.js";
import Transaction from "../models/transaction.js";
import User from "../models/user.js";

export default class AuthenticationMiddleware {
  static async isPostAuthor(req, res, next) {
    const { id } = req.params;
    try {
      const post = await Post.findById(id);
      if (!post.owner.equals(res.locals.user)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    } catch (err) {
      next(err);
    }
    next();
  }

  static async isMessageAuthor(req, res, next) {
    const { id } = req.params;
    try {
      const message = await Message.findById(id);
      if (!message.owner.equals(res.locals.user)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    } catch (err) {
      next(err);
    }
    next();
  }

  static async postPermission(req, res, next) {
    try {
      const checkUser = await User.findById(res.locals.user).select(
        "+isAllowPost"
      );
      const { isAllowPost } = checkUser;
      if (!isAllowPost) {
        return res.status(401).json({ error: "Permission has been denied." });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async messagePermission(req, res, next) {
    try {
      const checkUser = await User.findById(res.locals.user).select(
        "+isAllowMessage"
      );
      const { isAllowMessage } = checkUser;
      if (!isAllowPost) {
        return res.status(401).json({ error: "Permission has been denied." });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async transactionInvolved(req, res, next) {
    const { id } = req.params;
    try {
      const transaction = await Transaction.findById(id);
      if (!transaction.owner && transaction.dealer) {
        if (transaction.dealer.equals(res.locals.user)) {
          return next();
        }
      }
      if (transaction.owner && transaction.dealer) {
        if (transaction.owner.equals(res.locals.user)) {
          return next();
        }
        if (transaction.dealer.equals(res.locals.user)) {
          return next();
        }
      }
      return res.status(401).json({ error: "Unauthorized" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async permissionCheck(req, res, next) {
    try {
      const checkUser = await User.findById(res.locals.user).select(
        "+accountAuthority"
      );

      if (checkUser) {
        const { accountAuthority } = checkUser;
        if (accountAuthority !== "admin") {
          return res.status(401).json({ error: "Unauthorized" });
        }
        next();
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async hasQueryUser(req, res, next) {
    const { user } = req.query;
    if (!user) {
      return next();
    }
    if (!res.locals.user || user !== res.locals.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  }

  static async hasQueryPublic(req, res, next) {
    const { isPublic } = req.query;
    if (!isPublic) {
      return next();
    }
    if (!res.locals.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const checkUser = await User.findById(res.locals.user).select(
        "+accountAuthority"
      );
      if (checkUser.accountAuthority !== "admin") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async isAdminOrOwner(req, res, next) {
    const { id } = req.params;
    try {
      const post = await Post.findById(id);
      const checkUser = await User.findById(res.locals.user).select(
        "+accountAuthority"
      );
      const { accountAuthority } = checkUser;
      if (post.owner.equals(res.locals.user) || accountAuthority === "admin") {
        return next();
      }
    } catch (err) {
      next(err);
    }
    res.status(401).json({ error: "Unauthorized" });
  }

  static isUserSelf(req, res, next) {
    const { id } = req.params;
    if (res.locals.user !== id) {
      return res.status(403).json({ message: "Unauthorized" });
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
        if (info) {
          return res.json({ error: true, message: info.message });
        }
        if (!user) {
          return res.json(info);
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
          return next(err);
        }
        if (info) {
          return res.json({ error: true, message: info.message });
        }

        const token = req.headers.authorization.split(" ")[1];
        const { sub } = JWT.verify(token, process.env.JWT_SECRET);
        res.locals.user = sub.id;
        next();
      }
    )(req, res, next);
  }
}
