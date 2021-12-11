import mongoose from "mongoose";
import Message from "../models/message.js";
import Post from "../models/post.js";

//TEMPORARY
import User from "../models/user.js";

import { optionsSetup, paginateObject } from "../utils/paginateOptionSetup.js";
const { ObjectId } = mongoose.Types;

export default class MessageControllers {
  // READ all messages (for admin)
  static async getAllMessages(req, res, next) {
    const { page, size, type } = req.query;
    const matchQuery = type ? { messageType: type } : {};
    const options = optionsSetup(page, size, "", {
      path: "owner post",
      select: "email nickname itemName",
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

  // READ post related messages
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
            "ownerInfo.nickname": 1,
            relatedMsg: 1,
            messageType: 1,
            applyDealMethod: 1,
            updatedAt: 1,
          },
        },
        {
          $group: {
            _id: "$messageType",
            messages: { $push: "$$ROOT" },
          },
        },
      ]);

      // change time to zh-tw
      const timeOptions = {
        timeZone: "Asia/Taipei",
        hour12: false,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      };
      for (const msg of allMsgs) {
        const { messages } = msg;
        for (const mes of messages) {
          mes.updatedAt = new Date(mes.updatedAt).toLocaleString(
            "zh-TW",
            timeOptions
          );
        }
      }

      res.status(200).json({ message: "success", postMessages: allMsgs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // READ transaction related messages as 1:1
  static async getTransactionRelatedMessages(req, res, next) {
    const { id } = req.params;

    try {
      const allMsgs = await Message.find({ deal: ObjectId(id) }).populate(
        "owner deal",
        "email nickname post"
      );
      res.status(200).json({ message: "success", dealMessages: allMsgs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // READ one message as for editing
  static async getOneMessage(req, res, next) {
    const { id } = req.params;
    try {
      const msg = await Message.findById(id).populate(
        "owner post",
        "email nickname itemName"
      );

      res.status(200).json({ message: "success", messageContent: msg });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // CREATE a message (transaction or post)
  static async createMessage(req, res, next) {
    const {
      content,
      sevenEleven,
      familyMart,
      faceToFace,
      messageType,
      relatedId,
    } = req.body; // relatedId is a post or transaction
    try {
      const { _id, dealer, tradingOptions } =
        (await Post.findById(relatedId)) ||
        (await Transaction.findById(relatedId));

      if (!_id) {
        return res
          .status(404)
          .json({ message: "The subject You are looking for does not exist." });
      }

      // TEMPORARY self-filled userID
      const user = await User.findOne({ email: "dealer@mail.com" });

      let newMessage;
      if (messageType === "question") {
        newMessage = await Message.create({
          content,
          messageType,
          post: ObjectId(_id),
          owner: ObjectId(user._id), // owner: ObjectId(res.locals.user),
        });
      } else if (messageType === "apply") {
        if (!sevenEleven && !familyMart && !faceToFace) {
          return res
            .status(401)
            .json({ error: "Must choose one deal method to proceed." });
        }

        let applyDealMethod;
        if (!tradingOptions.convenientStores.length) {
          applyDealMethod = tradingOptions.faceToFace;
        }

        for (let store of tradingOptions.convenientStores) {
          if (sevenEleven && store === "7-11") {
            applyDealMethod = { convenientStore: store };
            break;
          }
          if (familyMart && store === "全家") {
            applyDealMethod = { convenientStore: store };
            break;
          } else {
            return res.status(403).json({
              error:
                "the deal method you choose is does not provide from the post",
            });
          }
        }

        newMessage = await Message.create({
          content,
          messageType,
          applyDealMethod,
          post: ObjectId(_id),
          owner: ObjectId(user._id), // owner: ObjectId(res.locals.user),
        });
      } else if (messageType === "transaction" && dealer) {
        newMessage = await Message.create({
          content,
          messageType,
          deal: ObjectId(_id),
          owner: ObjectId(user._id), // owner: ObjectId(res.locals.user),
        });
      }
      res.status(200).json({ message: "success", new: newMessage });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // CREATE a reply message (transaction or post)
  static async createReply(req, res, next) {
    const { id } = req.params; // message id
    const { content, messageType, relatedId } = req.body; // related id could be the post or transaction

    try {
      // check if the message is the related subject
      const checkMsg = await Message.findById(id);
      const related = checkMsg.post || checkMsg.deal;
      if (String(related) !== relatedId) {
        return res.status(200).json({ message: "No permission." });
      }

      // TEMPORARY self-filled userID
      const user = await User.find({ name: "owner" });

      let newReply;
      if (messageType !== "transaction" && !checkMsg.deal) {
        newReply = await Message.create({
          content,
          messageType,
          relatedMsg: ObjectId(id),
          post: ObjectId(relatedId),
          owner: ObjectId(user._id), // owner: ObjectId(res.locals.user),
        });
      } else {
        newReply = await Message.create({
          content,
          messageType,
          relatedMsg: ObjectId(id),
          deal: ObjectId(relatedId),
          owner: ObjectId(user._id), // owner: ObjectId(res.locals.user),
        });
      }
      res.status(200).json({ message: "success", new: newReply });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // UPDATE a message (transaction or post)
  static async updateMessage(req, res, next) {
    const { id } = req.params;
    const { content, sevenEleven, familyMart, faceToFace } = req.body;

    try {
      const checkMsg = await Message.findById(id);
      const getPost = await Post.findById(checkMsg.post);

      if (!checkMsg) {
        return res
          .status(404)
          .json({ error: "The subject you are looking for does not exist." });
      }
      const { messageType } = checkMsg;

      if (messageType === "question" || messageType === "transaction") {
        checkMsg.content = content;
      }
      if (messageType === "apply") {
        let applyDealMethod;
        if (!getPost.tradingOptions.convenientStores.length) {
          applyDealMethod = getPost.tradingOptions.faceToFace;
        }

        for (let store of getPost.tradingOptions.convenientStores) {
          if (sevenEleven && store === "7-11") {
            applyDealMethod = { convenientStore: store };
            break;
          }
          if (familyMart && store === "全家") {
            applyDealMethod = { convenientStore: store };
            break;
          } else {
            return res.status(403).json({
              error:
                "the deal method you choose is does not provide from the post",
            });
          }
        }

        checkMsg.content = content;
        checkMsg.applyDealMethod = applyDealMethod;
      }

      const editMsg = await checkMsg.save();

      if (editMsg) {
        res.status(200).json({ message: "success", update: editMsg });
      } else {
        return res.status(403).json({ error: "permission denied" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // DELETE message and its related
  static async deleteMessageAndRelated(req, res, next) {
    const { id } = req.params;

    try {
      const findMsgs = await Message.find({
        $or: [{ _id: id }, { relatedMsg: ObjectId(id) }],
      });

      let count = findMsgs.length;

      findMsgs.forEach(async (msg) => {
        await Message.deleteOne(msg);
      });

      if (count > 1) {
        return res.status(200).json({
          message: "delete all related messages successfully.",
        });
      }

      res.status(200).json({ message: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
