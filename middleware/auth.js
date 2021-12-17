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
      const post = await Post.findById(id).select("owner").lean();
      if (!post.owner.equals(res.locals.user)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    } catch (err) {
      next(err);
    }
    next();
  }

  static async isPostAuthorFromMsg(req, res, next) {
    const { id } = req.params;
    try {
      const msg = await Message.findById(id).select("post").lean();
      const post = await Post.findById(msg.post).select("owner").lean();
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
      const message = await Message.findById(id).select("owner").lean();
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
      const checkUser = await User.findById(res.locals.user)
        .select("isAllowPost")
        .lean();
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
      const checkUser = await User.findById(res.locals.user)
        .select("isAllowMessage")
        .lean();
      const { isAllowMessage } = checkUser;
      if (!isAllowMessage) {
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
      const transaction = id
        ? await Transaction.findById(id).select("owner dealer").lean()
        : await Transaction.find({
            $or: [{ owner: res.locals.user }, { dealer: res.locals.user }],
          })
            .select("owner dealer")
            .lean();
      if (transaction.length >= 0) {
        return next();
      }
      if (
        transaction.owner.equals(res.locals.user) ||
        transaction.dealer.equals(res.locals.user)
      ) {
        return next();
      }

      res.status(401).json({ error: "Unauthorized" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async permissionCheck(req, res, next) {
    if (res.locals.auth) {
      if (res.locals.auth === "admin") {
        return next();
      }
    }
    res.status(401).json({ error: "Unauthorized" });
  }

  static async hasQueryUser(req, res, next) {
    const { user } = req.query;

    const token = req.headers.authorization.split(" ")[1];
    const {
      sub: { id },
    } = JWT.verify(token, process.env.JWT_SECRET);

    if (!user) {
      return next();
    }
    if (!id || user !== id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  static async hasQueryPublic(req, res, next) {
    const { isPublic } = req.query;

    const token = req.headers.authorization.split(" ")[1];
    const {
      sub: { accountAuthority },
    } = JWT.verify(token, process.env.JWT_SECRET);

    if (!isPublic) {
      return next();
    }
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (accountAuthority !== "admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  }

  static async isAdminOrOwner(req, res, next) {
    const { id } = req.params;
    try {
      const post = await Post.findById(id).select("owner").lean();
      if (post.owner.equals(res.locals.user) || res.locals.auth === "admin") {
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
          return next(err);
        }
        if (info) {
          return res.json({ error: true, message: info.message });
        }

        const token = req.headers.authorization.split(" ")[1];
        const { sub } = JWT.verify(token, process.env.JWT_SECRET);
        res.locals.user = sub.id;
        res.locals.auth = sub.accountAuthority;
        next();
      }
    )(req, res, next);
  }
}
