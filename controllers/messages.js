import Message from "../models/message.js";
import Post from "../models/post.js";
import mongoose from "mongoose";

import { optionsSetup, paginateObject } from "./paginateOptionSetup.common.js";
const { ObjectId } = mongoose.Types;

export default class MessageControllers {
  static async getAllMessages(req, res, next) {
    //TODO: user authentication
    const { page, size, type } = req.query;
    const matchQuery = type ? { messageType: type } : {};
    const options = optionsSetup(page, size, "", {
      path: "owner post",
      select: "email name itemName",
    });
    const { limit } = options;

    try {
      const getAllMsgs = await Message.paginate(matchQuery, options);
      const { totalDocs, page, docs } = getAllMsgs;
      const paginate = paginateObject(totalDocs, limit, page);
      const allMsgs = docs;

      res
        .status(200)
        .json({ message: "success", paginate, allMessages: allMsgs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getPostRelatedMessages(req, res, next) {
    const { id } = req.params;

    try {
      const allMsgs = await Message.aggregate([
        { $match: { post: ObjectId(id) } },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerInfo",
          },
        },
        {
          $project: {
            content: 1,
            owner: 1,
            "ownerInfo.email": 1,
            "ownerInfo.name": 1,
            relatedMsg: 1,
            messageType: 1,
          },
        },
        {
          $group: {
            _id: "$messageType",
            messages: { $push: "$$ROOT" },
          },
        },
      ]);
      res.status(200).json({ message: "success", postMessages: allMsgs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getTransactionRelatedMessages(req, res, next) {
    //TODO: user authentication
    const { id } = req.params;

    try {
      const allMsgs = await Message.find({ deal: ObjectId(id) }).populate(
        "owner deal",
        "email name post"
      );
      res.status(200).json({ message: "success", dealMessages: allMsgs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getOneMessage(req, res, next) {
    //TODO: user authentication
    const { id } = req.params;
    try {
      const msg = await Message.findById(id).populate(
        "owner post",
        "email name itemName"
      );

      res.status(200).json({ message: "success", messageContent: msg });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createMessage(req, res, next) {
    // TODO: user authentication
    const { content, messageType, relatedId, userId } = req.body; // relatedId is a post or transaction

    const { _id } =
      (await Post.findById(relatedId)) ||
      (await Transaction.findById(relatedId));
    try {
      let newMessage;
      if (messageType !== "transaction") {
        newMessage = await Message.create({
          content,
          messageType,
          post: ObjectId(_id),
          owner: ObjectId(userId),
        });
      } else {
        newMessage = await Message.create({
          content,
          messageType,
          deal: ObjectId(_id),
          owner: ObjectId(userId),
        });
      }
      res.status(200).json({ message: "success", new: newMessage });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createReply(req, res, next) {
    // TODO: user authentication
    const { id } = req.params; // message id
    const { content, messageType, relatedId, userId } = req.body; // related id could be the post or transaction

    try {
      // check if the message is the related subject
      const checkMsg = await Message.findById(id);
      const related = checkMsg.post || checkMsg.deal;
      if (String(related) !== relatedId) {
        return res.status(200).json({ message: "No permission." });
      }

      let newReply;
      if (messageType !== "transaction") {
        newReply = await Message.create({
          content,
          messageType,
          relatedMsg: ObjectId(id),
          post: ObjectId(relatedId),
          owner: ObjectId(userId),
        });
      } else {
        newReply = await Message.create({
          content,
          messageType,
          relatedMsg: ObjectId(id),
          deal: ObjectId(relatedId),
          owner: ObjectId(userId),
        });
      }
      res.status(200).json({ message: "success", new: newReply });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateMessage(req, res, next) {
    //TODO: user authentication
    const { id } = req.params;
    const { content, userId } = req.body;

    try {
      const editMsg = await Message.findOneAndUpdate(
        { _id: id, owner: ObjectId(userId) },
        { content },
        {
          runValidators: true,
          new: true,
        }
      );
      if (editMsg) {
        res.status(200).json({ message: "success", update: editMsg });
      } else {
        return res.status(403).json({ error: "permission denied" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteMessageAndRelated(req, res, next) {
    // TODO: user authentication
    const { id } = req.params;

    try {
      const findMsg = await Message.findById(id);
      if (!findMsg.relatedMsg) {
        const findRelatedMsgs = await Message.find({
          $or: [{ _id: id }, { relatedMsg: ObjectId(id) }],
        });
        if (findRelatedMsgs.length) {
          findRelatedMsgs.forEach(async (msg) => {
            await Message.deleteOne(msg);
          });
          return res.status(200).json({
            message: "delete all related messages successfully.",
          });
        }
      }
      await findMsg.delete();
      res.status(200).json({ message: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
