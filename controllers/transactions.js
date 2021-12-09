import mongoose from "mongoose";
import Transaction from "../models/transaction.js";
import Post from "../models/post.js";
import User from "../models/user.js";
import Message from "../models/message.js";

import { optionsSetup, paginateObject } from "../utils/paginateOptionSetup.js";

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
      // case "isSent":
      //   progressFilters.isFilled = true;
      //   progressFilters.isPaid = true;
      //   // progressFilters.isSent = true;
      //   progressFilters.isCompleted = false;
      //   break;
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
    // TEMPORARY userfilled userID
    const owner = await User.findOne({ email: "owner@mail.com" });
    const dealer = await User.findOne({ email: "dealer@mail.com" });

    const progressQuery = {
      $or: [{ owner: owner._id }, { dealer: dealer._id }],
      // $or: [{ owner: res.locals.user }, { dealer: res.locals.user }],
      ...progressFilters,
    };
    const options = optionsSetup(page, size, "-expiredAt", {
      path: "post owner dealer",
      select:
        "_id itemName quantity givenAmount imgUrls email nickname avatarUrl",
    });
    const { limit } = options;
    try {
      const getAllTrans = await Transaction.paginate(progressQuery, options);
      const { totalDocs, page, docs } = getAllTrans;
      const paginate = paginateObject(totalDocs, limit, page);
      const allTrans = docs;

      if (!allTrans.length) {
        return res.status(200).json({ message: "No deal submitted yet." });
      }

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
      const trans = await Transaction.findById(id)
        .select("-expiredAt")
        .populate(
          "post owner dealer",
          "itemName account nickname email imgUrls avatarUrl"
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
  /*
  // READ a pre-transaction for dealer info and available amount steps : step 1-1
  static async getTransactionDealerAndPost(req, res, next) {
    const { user } = req.query; // 欲發出交易邀請的索取者id
    const { id } = req.params; //post id

    try {
      const getPost = await Post.aggregate([
        { $match: { _id: ObjectId(id) } },
        {
          $project: {
            id: 1,
            owner: 1,
            itemName: 1,
            remain: { $subtract: ["$quantity", "$givenAmount"] },
          },
        },
      ]);
      const getTrans = await Transaction.aggregate([
        { $match: { post: ObjectId(id) } },
        {
          $group: {
            _id: { transId: "$id", owner: "$owner", post: "$post" },
            dealers: { $push: "$dealer" },
            reservedTransAmount: { $sum: "$amount" },
            includedTrans: { $sum: 1 },
          },
        },
      ]);

      if (getTrans.length) {
        getPost[0].remain -= getTrans[0].reservedTransAmount;
      }

      const getDealer = await User.findById(user).select("id nickname email");
      if (!getDealer) {
        return res
          .status(200)
          .json({ message: "The user you are looking for does not exist." });
      }

      if (getDealer.id === String(getPost[0].owner)) {
        return res.status(200).json({ message: "Not a valid dealer." });
      }
      res.status(200).json({
        message: "success",
        postInfo: getPost,
        dealerInfo: getDealer,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // CREATE a transaction send invitation and selected amount steps : step 1-2
  static async createRequestTransaction(req, res, next) {
    const { id } = req.params; // postId
    const { amount, userId } = req.body; // 贈送數量, 索取者ID

    // check if amount is acceptable
    if (!amount) {
      return res.status(200).json({ message: "amount can not be 0!" });
    }

    try {
      // get present transaction deals' total amount as reservedTransAmount
      const presentDeals = await Transaction.aggregate([
        { $match: { post: ObjectId(id) } },
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
        { $match: { _id: ObjectId(id) } },
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
        if (remain - reservedTransAmount < amount) {
          return res
            .status(200)
            .json({ message: "Amount is over remain quantities." });
        }
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }

    try {
      //check if dealer id exist
      const getUser = await User.findById(userId);
      if (!getUser) {
        return res
          .status(200)
          .json({ message: "The user you are looking for does not exist." });
      }
      // create
      const newTrans = await Transaction.create({
        amount,
        post: id,
        dealer: userId,
      });
      if (newTrans) {
        res.status(200).json({ message: "success", new: newTrans });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // READ a transaction invitation  for owner info, a set-amount, and available deal options steps : step 2-1
  static async getTransactionOwnerRequest(req, res, next) {
    const { user, post } = req.query; //(發出交易邀請的)刊登者Id,刊登 ID
    const { id } = req.params; //Transaction id

    try {
      const getTrans = await Transaction.findOne({
        _id: ObjectId(id),
        post: ObjectId(post),
      })
        .select("amount")
        .populate("post", "itemName owner tradingOptions");

      // check if user is exist, and transaction ownerId and userId is equivalent
      const checkOwner = await User.findById(user).select("name email");
      if (!checkOwner) {
        return res
          .status(200)
          .json({ message: "The user you are looking for does not exist." });
      }

      if (checkOwner.id !== String(getTrans.post.owner)) {
        return res.status(403).json({ message: "Permission denied." });
      }

      res.status(200).json({
        message: "success",
        transPostInfo: getTrans,
        ownerInfo: checkOwner,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // UPDATE a transaction accept invitation and selected deal method steps : step 2-2 FINISH
  static async updateAcceptTransaction(req, res, next) {
    const { id } = req.params; // trans id
    const { ownerId, postId, convenientStore, faceToFace } = req.body; // 刊登者ID, postid, 選定的交易方式

    try {
      const checkTrans = await Transaction.findOne({
        _id: ObjectId(id),
        post: ObjectId(postId),
      })
        .select("amount")
        .populate("post", "tradingOptions itemName owner");

      if (!checkTrans) {
        return res.status(401).json({ message: "Permission denied" });
      }

      //check if ownerId and checkTrans's ownerId is equivalent
      if (ownerId !== String(checkTrans.post.owner)) {
        return res.status(401).json({ message: "Permission denied." });
      }

      //check if either convenientStore or faceToFace is selected
      if (!convenientStore && !faceToFace) {
        return res.status(400).json({
          message: "must select a trading options to confirm the deal.",
        });
      }

      // get dealMethod
      const dealMethodKey = checkTrans.post.tradingOptions.convenientStore
        .storeCode
        ? "convenientStore"
        : "faceToFace";
      const dealMethod =
        checkTrans.post.tradingOptions[
          convenientStore ? convenientStore : faceToFace
        ];
      const confirmTrans = await Transaction.findByIdAndUpdate(
        { _id: checkTrans.id },
        {
          owner: ObjectId(ownerId),
          dealMethod: { [dealMethodKey]: dealMethod },
          $unset: { expiredAt: 1 },
        },
        { runValidators: true, new: true }
      );
      res
        .status(200)
        .json({ message: "success", transactionConfirm: confirmTrans });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  */

  // CREATE a transaction (base on apply message)
  static async createTransaction(req, res, next) {
    const { id } = req.params;
    const { amount, accountName, accountNum, bankCode, bankName } = req.body;

    if (!amount) {
      return res.status(200).json({ message: "amount is required." });
    }
    try {
      const applyMsg = await Message.findById(id);

      if (!applyMsg) {
        return res
          .status(404)
          .json({ message: "The message you are looking for does not exist." });
      }

      // get present transaction deals' total amount as reservedTransAmount
      const presentDeals = await Transaction.aggregate([
        { $match: { post: ObjectId(applyMsg.post) } },
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
        if (remain - reservedTransAmount < amount) {
          return res
            .status(200)
            .json({ message: "Amount is over remain quantities." });
        }
      }

      //create transaction : no account-info required as faceToFace
      const isFace = applyMsg.applyDealMethod.faceToFace ? true : false;
      if (!isFace) {
        if (!accountName || !accountNum || !bankCode || !bankName) {
          return res.status(404).json({ message: "All fields is required" });
        }
        const account = { accountName, accountNum, bankCode, bankName };
        //TMEPORARY userFilled ID
        const owner = await User.findOne({ email: "owner@mail.com" }); // const owner = await User.findById(res.locals.user)

        const updateAccount = await User.findByIdAndUpdate(
          owner._id,
          { account },
          { runValidators: true, new: true }
        );
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

      res.status(200).json({ message: "success", transaction: newTrans });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // UPDATE transaction deal: filling sending info
  static async updateFillingProgress(req, res, next) {
    const { id } = req.params;
    const { name, cellPhone, storeCode, storeName } = req.body;

    try {
      //TEMPORARY userfilled userID
      const dealer = await User.findOne({ email: "dealer@mail.com" });

      const getTrans = await Transaction.findOne({
        _id: id,
        dealer: dealer._id, // dealer: res.locals.user,
      });
      if (!getTrans) {
        return res.status(403).json({ message: "Permission denied." });
      }
      if (getTrans.dealMethod.faceToFace) {
        const updateProcess = await Transaction.findOneAndUpdate(
          { _id: id, dealer: ObjectId(dealer._id) }, // { _id: id, dealer: ObjectId(res.locals.user) },
          { isFilled: true, isPaid: true },
          { runValidators: true, new: true }
        );
        return res
          .status(200)
          .json({ message: "success", updated: updateProcess });
      }

      const dataStructure = {
        sendingInfo: {
          name,
          cellPhone,
          storeCode,
          storeName,
        },
      };
      dataStructure.isFilled = true;
      const updateProcess = await Transaction.findOneAndUpdate(
        { _id: id, dealer: ObjectId(dealer._id) }, // { _id: id, dealer: ObjectId(res.locals.user) },
        dataStructure,
        { runValidators: true, new: true }
      );
      res.status(200).json({ message: "success", updated: updateProcess });
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  // UPDATE user accountInfo if none;  for ATM usage
  static async updateUserAccount(req, res, next) {
    const { id } = req.params;
    const { accountName, accountNum, bankCode, bankName } = req.body;
    try {
      const checkUser = await User.findOne({ email: "owner@mail.com" }); // const checkUser = await User.findById(res.locals.user);
      if (!checkUser || String(res.locals.user) !== id) {
        return res.status(403).json({ message: "Permission denied" });
      }

      const updateUser = await User.findByIdAndUpdate(
        id,
        { account: { accountName, accountNum, bankCode, bankName } },
        { runValidators: true, new: true }
      );
      res.status(200).json({ message: "success", update: updateUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // UPDATE a transaction deal: is paid
  static async updatePaymentProgress(req, res, next) {
    const { id } = req.params;
    try {
      // TEMPORARY userfilled userID
      const dealer = User.findOne({ email: "dealer@mail.com" });

      const checkProcess = await Transaction.findOne({
        _id: ObjectId(id),
        dealer: dealer._id, // dealer: res.locals.user,
      });

      if (!checkProcess) {
        return res.status(403).json({ message: "Permission denied" });
      }

      if (checkProcess.isFilled) {
        const updateProcess = await Transaction.findByIdAndUpdate(
          id,
          { isPaid: true, isCancelable: false },
          { runValidators: true, new: true }
        );
        res.status(200).json({ message: "success", update: updateProcess });
      } else {
        return res.status(403).json({ error: "Permission denied" });
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  // UPDATE a transaction deal: is send out
  // static async updateSendoutProgress(req, res, next) {
  //   const { id } = req.params;
  //   try {
  //     // TEMPORARY userfilled userID
  //     const owner = await User.findOne({ email: "owner@mail.com" });

  //     const checkProcess = await Transaction.findOne({
  //       _id: ObjectId(id),
  //       owner: owner._id, // owner: res.locals.user,
  //     });
  //     if (!checkProcess) {
  //       return res.status(403).json({ message: "Permission denied" });
  //     }
  //     if (checkProcess.isFilled && checkProcess.isPaid) {
  //       const updateProcess = await Transaction.findByIdAndUpdate(
  //         id,
  //         { isSent: true },
  //         { runValidators: true, new: true }
  //       );
  //       if (updateProcess) {
  //         res.status(200).json({ message: "success", update: updateProcess });
  //       }
  //     } else {
  //       return res.status(403).json({ error: "Permission denied" });
  //     }
  //   } catch (err) {
  //     res.status(500).json(err.message);
  //   }
  // }

  // UPDATE a transaction deal: is complete
  static async updateCompleteProgress(req, res, next) {
    //TODO: user authentication
    const { id } = req.params;

    try {
      // TEMPORARY userfilled userID
      const dealer = await User.findOne({ email: "dealer@mail.com" });

      const checkProcess = await Transaction.findOne({
        _id: ObjectId(id),
        dealer: dealer._id, // dealer: res.locals.user,
      });
      if (!checkProcess) {
        return res.status(403).json({ message: "Permission denied" });
      }
      if (checkProcess.isFilled && checkProcess.isPaid) {
        const updateProcess = await Transaction.findByIdAndUpdate(
          id,
          { isCompleted: true },
          { runValidators: true, new: true }
        );
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
      } else {
        return res.status(403).json({ message: "Permission denied" });
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
      const checkTrans = await Transaction.findById(id);
      if (!checkTrans) {
        return res.status(404).json({
          message: "The Transaction you are looking for does not exist.",
        });
      }

      if (!checkTrans.isCancelable && checkTrans.isPaid) {
        return res.status(403).json({
          message:
            "The progress has gone through payment period, it can not be canceled.",
        });
      }

      checkTrans.isCanceled = !checkTrans.isCanceled;

      await checkTrans.save();

      res.status(200).json({ message: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
