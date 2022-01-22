import mongoose from "mongoose";
import Transaction from "../models/transaction.js";
import Post from "../models/post.js";
import User from "../models/user.js";
import Message from "../models/message.js";

import { optionsSetup, paginateObject } from "../utils/paginateOptionSetup.js";
import { errorResponse } from "../utils/errorMsgs.js";

const { ObjectId } = mongoose.Types;

export default class TransactionControllers {
  // READ all transactions of a user
  static async getAllTransactions(req, res, next) {
    const { page, size, progress } = req.query;

    const progressFilters = {};
    switch (progress) {
      case "isFilled":
        progressFilters.isFilled = true;
        progressFilters.isPaid = false;
        // progressFilters.isSent = false;
        progressFilters.isCompleted = false;
        break;
      case "isPaid":
        progressFilters.isFilled = true;
        progressFilters.isPaid = true;
        // progressFilters.isSent = false;
        progressFilters.isCompleted = false;
        break;
      case "isCompleted":
        progressFilters.isFilled = true;
        progressFilters.isPaid = true;
        // progressFilters.isSent = true;
        progressFilters.isCompleted = true;
        break;
      case "isCanceled":
        progressFilters.isCanceled = true;
        break;
    }

    const progressQuery = {
      $or: [{ owner: res.locals.user }, { dealer: res.locals.user }],
      ...progressFilters,
    };
    const options = optionsSetup(page, size, "", {
      path: "post owner dealer",
      select:
        "_id itemName quantity givenAmount imgUrls email nickname avatarUrl.imgUrl",
    });
    const { limit } = options;
    try {
      const getAllTrans = await Transaction.paginate(progressQuery, options);

      if (!getAllTrans.totalDocs) {
        return res
          .status(200)
          .json({ message: "No deal submitted yet. - 目前尚未成立交易" });
      }

      const { totalDocs, page, docs } = getAllTrans;
      const paginate = paginateObject(totalDocs, limit, page);
      const allTrans = docs;

      res
        .status(200)
        .json({ message: "success", paginate, allTransactions: allTrans });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // READ a transaction
  static async getOneTransaction(req, res, next) {
    const { id } = req.params;
    try {
      const trans = await Transaction.findById(id).populate(
        "post owner dealer",
        "itemName account nickname email imgUrls avatarUrl.imgUrl"
      );

      if (trans) {
        res.status(200).json({ message: "success", dealInfo: trans });
      } else {
        return res
          .status(200)
          .json({ error: "The deal you are looking for does not exist." });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // CREATE a transaction (base on apply message)
  static async createTransaction(req, res, next) {
    const { id } = req.params; //message id
    const { accountNum, bankCode } = req.body;
    let { amount } = req.body;

    if (!amount) {
      amount = 1;
      //errorResponse(res, 400);
      //return;
    }
    try {
      const applyMsg = await Message.findById(id);

      if (!applyMsg) {
        errorResponse(res, 404);
        return;
      }

      // get present transaction deals' total amount as reservedTransAmount
      const presentDeals = await Transaction.aggregate([
        { $match: { post: ObjectId(applyMsg.post), isCanceled: false } },
        {
          $group: {
            _id: { transId: "$id", owner: "$owner", post: "$post" },
            dealers: { $push: "$dealer" },
            reservedTransAmount: { $sum: "$amount" },
            includedTrans: { $sum: 1 },
          },
        },
      ]);

      // get post of actual amount as remain
      const remainAmount = await Post.aggregate([
        { $match: { _id: ObjectId(applyMsg.post) } },
        {
          $project: {
            id: 1,
            owner: 1,
            remain: { $subtract: ["$quantity", "$givenAmount"] },
          },
        },
      ]);

      //check if required amount is over actual quantities
      if (presentDeals.length && remainAmount) {
        const { remain } = remainAmount[0];
        const { reservedTransAmount } = presentDeals[0];
        if (amount > remain - reservedTransAmount) {
          return res.status(200).json({
            message: `Amount is over remain quantities. remain: ${
              remain - reservedTransAmount
            }`,
          });
        }
      }

      //create transaction : no account-info required as faceToFace
      const owner = await User.findById(res.locals.user);
      const isFace = applyMsg.applyDealMethod.faceToFace ? true : false;
      if (!isFace) {
        if (!accountNum || !bankCode) {
          errorResponse(res, 400);
          return;
        }
        const account = { accountNum, bankCode };

        owner.account = { ...account };
        await owner.save();
      }

      const newTrans = await Transaction.create({
        amount,
        dealMethod: { ...applyMsg["applyDealMethod"] },
        post: applyMsg.post,
        owner: owner._id,
        dealer: applyMsg.owner,
        isFilled: isFace,
        isPaid: isFace,
      });

      // applyMsg.isDealing = true;
      // await applyMsg.save();

      res.status(200).json({ message: "success", transaction: newTrans });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // UPDATE transaction deal: filling sending info (for convenientStore)
  static async updateFillingProgress(req, res, next) {
    const { id } = req.params;
    const { name, cellPhone, storeCode, storeName } = req.body;

    if (!name || !cellPhone || !storeCode || !storeName) {
      errorResponse(res, 400);
      return;
    }

    try {
      const dataStructure = {
        sendingInfo: {
          name,
          cellPhone,
          storeCode,
          storeName,
        },
      };
      dataStructure.isFilled = true;
      dataStructure.isCancelable = false;
      const updateProcess = await Transaction.findOneAndUpdate(
        { _id: id, dealer: ObjectId(res.locals.user) },
        dataStructure,
        { runValidators: true, new: true }
      );
      await updateProcess.populate({ path: "owner", select: "account" });
      res.status(200).json({ message: "success", updated: updateProcess });
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  // UPDATE user accountInfo if none;  for ATM usage
  static async updateUserAccount(req, res, next) {
    const { id } = req.params;
    const { accountNum, bankCode } = req.body;

    if (!accountNum || !bankCode) {
      errorResponse(res, 400);
      return;
    }

    try {
      const updateUser = await User.findByIdAndUpdate(
        id,
        { account: { accountNum, bankCode } },
        { runValidators: true, new: true }
      );
      res.status(200).json({ message: "success", update: updateUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // UPDATE a transaction deal: is paid (for convenientStore)
  static async updatePaymentProgress(req, res, next) {
    const { id } = req.params;
    try {
      const checkProcess = await Transaction.findOne({
        _id: ObjectId(id),
        dealer: res.locals.user,
      });

      if (checkProcess.isFilled) {
        checkProcess.isPaid = true;
        const updateProcess = await checkProcess.save();

        res.status(200).json({ message: "success", update: updateProcess });
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  // UPDATE a transaction deal: is complete
  static async updateCompleteProgress(req, res, next) {
    const { id } = req.params;

    try {
      const checkProcess = await Transaction.findOne({
        _id: ObjectId(id),
        dealer: res.locals.user,
      });

      if (checkProcess.isFilled && checkProcess.isPaid) {
        checkProcess.isCompleted = true;
        checkProcess.isCancelable = false;
        const updateProcess = await checkProcess.save();

        const givenRecord = await Post.findByIdAndUpdate(
          { _id: ObjectId(updateProcess.post) },
          { $inc: { givenAmount: updateProcess.amount } },
          { runValidators: true, new: true }
        );

        if (givenRecord) {
          const checkGoal = await Post.aggregate([
            {
              $match: { _id: ObjectId(updateProcess.post) },
            },
            {
              $project: {
                _id: 0,
                quantity: 1,
                givenAmount: 1,
                reachGoal: { $eq: ["$quantity", "$givenAmount"] },
              },
            },
          ]);

          if (checkGoal[0].reachGoal) {
            await Post.findByIdAndUpdate(
              { _id: ObjectId(updateProcess.post) },
              { isGoal: true },
              { runValidators: true, new: true }
            );
          }
        }

        if (updateProcess) {
          res.status(200).json({ message: "success", update: updateProcess });
        }
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // UPDATE a transaction status: cancel
  static async updateCancelTrans(req, res, next) {
    const { id } = req.params;
    try {
      // check Progress
      const checkTrans = await Transaction.findById(id).select(
        "isCanceled isCancelable"
      );

      if (!checkTrans.isCancelable) {
        return res.status(403).json({
          message:
            "The progress is over cancelable duration, it can not be cancel",
        });
      }

      checkTrans.isCanceled = true;

      await checkTrans.save();

      // let changeMsgStatus = await Message.findOne({author: checkTrans.dealer, applyDealMethod: checkTrans.dealMethod, isDealing: true})
      // changeMsgStatus.isDealing = false;
      // await changeMsgStatus.save();


      res.status(200).json({ message: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
