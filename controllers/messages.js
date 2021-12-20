import mongoose from "mongoose";
import Message from "../models/message.js";
import Post from "../models/post.js";
import Transaction from "../models/transaction.js";

import { optionsSetup, paginateObject } from "../utils/paginateOptionSetup.js";
import { errorResponse } from "../utils/errorMsgs.js";
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

      if (!getAllMsgs.totalDocs) {
        return res
          .status(200)
          .json({ message: "No message in present - 尚未建立留言資料" });
      }

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
            isDeleted: 1,
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

      if (!allMsgs.length) {
        return res.status(200).json({
          message: "No related message in present. - 目前沒有相關留言",
        });
      }

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

      if (!allMsgs.length) {
        return res.status(200).json({
          message: "No related message in present. - 目前沒有相關留言",
        });
      }

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
    const { content, chooseDealMethod, messageType, relatedId } = req.body; // relatedId is a post or transaction
    try {
      const related =
        (await Post.findById(relatedId)) ||
        (await Transaction.findById(relatedId));

      if (!related) {
        errorResponse(res, 404);
        return;
      }

      const { id, dealer, tradingOptions } = related;

      let dataStructure;
      if (messageType === "question") {
        dataStructure = {
          content,
          messageType,
          post: ObjectId(id),
        };
      } else if (messageType === "apply") {
        if (!chooseDealMethod) {
          errorResponse(res, 400);
          return;
        }
        dataStructure = {
          content,
          messageType,
          post: ObjectId(id),
        };

        if (
          !tradingOptions.convenientStores.length ||
          chooseDealMethod === "faceToFace"
        ) {
          dataStructure.applyDealMethod = {
            faceToFace: tradingOptions.faceToFace,
          };
        } else {
          for (let store of tradingOptions.convenientStores) {
            if (chooseDealMethod === "sevenEleven" && store === "7-11") {
              dataStructure.applyDealMethod = { convenientStore: store };
              break;
            }
            if (chooseDealMethod === "familyMart" && store === "全家") {
              dataStructure.applyDealMethod = { convenientStore: store };
              break;
            } else {
              errorResponse(res, 404);
              return;
            }
          }
        }
      } else if (messageType === "transaction" && dealer) {
        dataStructure = {
          content,
          messageType,
          deal: ObjectId(id),
        };
      }
      const newMessage = await Message.create({
        ...dataStructure,
        owner: ObjectId(res.locals.user),
      });
      res.status(200).json({ message: "success", new: newMessage });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // CREATE a reply message (transaction or post)
  static async createReply(req, res, next) {
    const { id } = req.params; // message id
    const { content, messageType, relatedId, relatedMsg } = req.body; // relatedId could be the post or transaction

    if (id !== relatedMsg) {
      return res
        .status(404)
        .json({ message: "The message to reply does not confirm." });
    }

    try {
      // check if the message is the related subject
      const checkMsg = await Message.findById(id);
      const related = checkMsg.post || checkMsg.deal;
      if (String(related) !== relatedId) {
        errorResponse(res, 400);
        return;
      }

      let dataStructure = { content, messageType, relatedMsg: ObjectId(id) };
      if (messageType !== "transaction" && !checkMsg.deal) {
        dataStructure.post = ObjectId(relatedId);
      } else {
        dataStructure.deal = ObjectId(relatedId);
      }
      const newReply = await Message.create({
        ...dataStructure,
        owner: ObjectId(res.locals.user),
      });
      res.status(200).json({ message: "success", new: newReply });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // UPDATE a message (transaction or post)
  static async updateMessage(req, res, next) {
    const { id } = req.params;
    const { content, chooseDealMethod } = req.body;

    try {
      const checkMsg = await Message.findById(id);
      const getPost = await Post.findById(checkMsg.post);

      if (!checkMsg || checkMsg.isDeleted) {
        errorResponse(res, 404);
        return;
      }
      const { messageType, relatedMsg } = checkMsg;

      // for every type of message in common
      checkMsg.content = content;

      if (messageType === "apply" && !relatedMsg) {
        if (chooseDealMethod === "faceToFace") {
          checkMsg.applyDealMethod = {
            [chooseDealMethod]: getPost.tradingOptions.faceToFace,
          };
        } else {
          for (let store of getPost.tradingOptions.convenientStores) {
            if (chooseDealMethod === "sevenEleven" && store === "7-11") {
              checkMsg.applyDealMethod = { convenientStore: store };
              break;
            }
            if (chooseDealMethod === "familyMart" && store === "全家") {
              checkMsg.applyDealMethod = { convenientStore: store };
              break;
            } else {
              errorResponse(res, 404);
              return;
            }
          }
        }
      }

      const editMsg = await checkMsg.save();

      if (editMsg) {
        res.status(200).json({ message: "success", update: editMsg });
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
        $or: [{ id: id }, { relatedMsg: ObjectId(id) }],
      });

      let count = findMsgs.length;

      findMsgs.forEach(async (msg) => {
        msg.isDeleted = true;
        await msg.save();
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
