import Post from "../models/post.js";
import Message from "../models/message.js";
import Transaction from "../models/transaction.js";
import User from "../models/user.js";

export default class AuthenticationMiddleware {
  static authenticator(req, res, next) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.locals.user = req.user;

    next();
  }

  static async isPostAuthor(req, res, next) {
    const { id } = req.params;
    try {
      const post = await Post.findById(id);
      if (!post.owner.equals(res.locals.user._id)) {
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
      if (!message.owner.equals(res.locals.user._id)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    } catch (err) {
      next(err);
    }
    next();
  }

  static async postPermission(req, res, next) {
    try {
      const checkUser = await User.findById(res.locals.user._id).select(
        "+isAllowPost"
      );
      const { isAllowPost } = checkUser;
      if (!isAllowPost) {
        return res.status(401).json({ error: "Permission been denied." });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async messagePermission(req, res, next) {
    try {
      const checkUser = await User.findById(res.locals.user._id).select(
        "+isAllowMessage"
      );
      const { isAllowMessage } = checkUser;
      if (!isAllowPost) {
        return res.status(401).json({ error: "Permission been denied." });
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
        if (transaction.dealer.equals(res.locals.user._id)) {
          return next();
        }
      }
      if (transaction.owner && transaction.dealer) {
        if (transaction.owner.equals(res.locals.user._id)) {
          return next();
        }
        if (transaction.dealer.equals(res.locals.user._id)) {
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
      const checkUser = await User.findById(res.locals.user._id).select(
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
    if (user !== String(res.locals.user._id)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  }
}