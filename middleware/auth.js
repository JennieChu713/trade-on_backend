import Post from "../models/post.js";
import Message from "../models/message.js";
import Transaction from "../models/transaction.js";

export const authenticator = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.locals.user = req.user;
  next();
};

export const isPostAuthor = async (req, res, next) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post.owner.equals(req.user._id)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    next(err);
  }
  next();
};

export const isMessageAuthor = async (req, res, next) => {
  const { id } = req.params;
  try {
    const message = await Message.findById(id);
    if (!message.owner.equals(req.user._id)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    next(err);
  }
  next();
};

export const isAdmin = (req, res, next) => {
  const { accountAuthority } = req.user;
  if (accountAuthority !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

export const isPostPermitted = (req, res, next) => {
  const { isAllowPost, isAllowMessage } = req.user;
  if (isAllowPost) {
    return res.status(401).json({ error: "Permission been denied." });
  }
  next();
};

export const isMessagePermitted = (req, res, next) => {
  const { isAllowMessage } = req.user;
  if (isAllowMessage) {
    return res.status(401).json({ error: "Permission been denied." });
  }
  next();
};

export const isTransactionRelated = async (req, res, next) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.findById(id);
    if (
      transaction.owner !== req.user._id &&
      transaction.dealer !== req.user._id
    ) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    next(err);
  }
  next();
};
