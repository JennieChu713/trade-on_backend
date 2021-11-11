import mongoose from "mongoose";
import Transaction from "../models/transaction.js";
import Post from "../models/post.js";
import User from "../models/user.js";

import { optionsSetup, paginateObject } from "./paginateOptionSetup.common.js";

const { ObjectId } = mongoose.Types;

export default class TransactionControllers {
  static async getAllTransactions(req, res, next) {
    //TODO: user authentication
    const { page, size, progress } = req.query;

    const progressFilters = {
      isFilled: false,
      isPaid: false,
      isSent: false,
      isCompleted: false,
    };
    switch (progress) {
      case "isFilled":
        progressFilters.isFilled = true;
        break;
      case "isPaid":
        progressFilters.isFilled = true;
        progressFilters.isPaid = true;
        break;
      case "isSent":
        progressFilters.isFilled = true;
        progressFilters.isPaid = true;
        progressFilters.isSent = true;
        break;
      case "isCompleted":
        progressFilters.isFilled = true;
        progressFilters.isPaid = true;
        progressFilters.isSent = true;
        progressFilters.isCompleted = true;
        break;
    }
    const progressQuery = {
      owner: { $exists: true },
      dealer: { $exists: true },
      ...progressFilters,
    };
    const options = optionsSetup(
      page,
      size,
      "-isFilled -isPaid -isSent -isCompleted -expiredAt",
      {
        path: "post owner dealer",
        select: "_id itemName quantity givenAmount email name",
      }
    );
    const { limit } = options;
    try {
      const getAllTrans = await Transaction.paginate(progressQuery, options); // TODO: find user from ownerId || dealerId
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

  static async getOneTransaction(req, res, next) {
    // TODO: user authentication
    const { id } = req.params;
    try {
      const trans = await Transaction.findById(id)
        .select("-expiredAt")
        .populate("post owner dealer", "itemName account name email");

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

  //create a transaction steps : step 1-1
  static async getTransactionDealerAndPost(req, res, next) {
    //TODO: user authentication
    const { user } = req.query; // 欲發出交易邀請的索取者id
    const { id } = req.params; //post id

    try {
      //Post.findOne(_id:id, owner: ObjectId(ownerId)) for verify
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

      getPost[0].remain -= getTrans[0].reservedTransAmount;

      const getDealer = await User.findById(user).select("id name email");
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

  //create a transaction steps : step 1-2
  static async createRequestTransaction(req, res, next) {
    //TODO: user authentication
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }

    //check if required amount is over actual quantities
    const { remain, _id } = remainAmount[0];
    if (presentDeals.length) {
      const { reservedTransAmount } = presentDeals[0];
      if (remain - reservedTransAmount < amount) {
        return res
          .status(200)
          .json({ message: "Amount is over remain quantities." });
      }
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

  //create a transaction steps : step 2-1
  static async getTransactionOwnerRequest(req, res, next) {
    // TODO: user authentication
    const { user, post } = req.query; //(發出交易邀請的)刊登者Id,刊登 ID
    const { id } = req.params; //Transaction id

    try {
      const getTrans = await Transaction.findOne({
        _id: ObjectId(id),
        post: ObjectId(post),
      })
        .select("amount")
        .populate("post", "itemName owner tradingOptions"); //await Transaction.find({ post: ObjectId(id), dealer: ObjectId(user)})

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

  //create a transaction steps : step 2-2 FINISH
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
        return res.status(200).json({ message: "Permission denied" });
      }

      //check if ownerId and checkTrans's ownerId is equivalent
      if (ownerId !== String(checkTrans.post.owner)) {
        return res.status(200).json({ message: "Permission denied." });
      }

      //check if either convenientStore or faceToFace is selected
      if (!convenientStore && !faceToFace) {
        return res.status(200).json({
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

  static async updateFillingProgress(req, res, next) {
    //TODO: user authentication
    const { id } = req.params;
    const { name, cellPhone, storeCode, storeName, userId } = req.body;

    try {
      const getTrans = await Transaction.findOne({
        _id: id,
        dealer: ObjectId(userId),
      });
      if (!getTrans) {
        return res.status(403).json({ message: "Permission denied." });
      }
      if (getTrans.dealMethod.faceToFace) {
        const updateProcess = await Transaction.findOneAndUpdate(
          { _id: id, dealer: ObjectId(userId) },
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
        { _id: id, dealer: ObjectId(userId) },
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
    //TODO: user authentication
    const { id } = req.params;
    const { accountName, accountNum, bankCode, bankName, userId } = req.body;
    try {
      const checkUser = User.findById(userId);
      if (!checkUser) {
        return res.status(403).json({ message: "Permission denied" });
      }
      if (String(checkUser._id) === id) {
        const updateUser = await User.findByIdAndUpdate(
          id,
          { account: { accountName, accountNum, bankCode, bankName } },
          { runValidators: true, new: true }
        );
        res.status(200).json({ message: "success", update: updateUser });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updatePaymentProgress(req, res, next) {
    //TODO: user authentication
    const { id } = req.params;
    const { userId } = req.body;
    try {
      const checkProcess = await Transaction.findOne({
        _id: ObjectId(id),
        dealer: ObjectId(userId),
      });
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

  static async updateSendoutProgress(req, res, next) {
    //TODO: user authentication
    const { id } = req.params;
    const { userId } = req.body;
    try {
      const checkProcess = await Transaction.findOne({
        _id: ObjectId(id),
        owner: ObjectId(userId),
      });
      if (!checkProcess) {
        return res.status(403).json({ message: "Permission denied" });
      }
      if (checkProcess.isFilled && checkProcess.isPaid) {
        const updateProcess = await Transaction.findByIdAndUpdate(
          id,
          { isSent: true },
          { runValidators: true, new: true }
        );
        await Post.findByIdAndUpdate(
          { _id: ObjectId(updateProcess.post) },
          { $inc: { givenAmount: updateProcess.amount } },
          { runValidators: true, new: true }
        );
        if (updateProcess) {
          res.status(200).json({ message: "success", update: updateProcess });
        }
      } else {
        return res.status(403).json({ error: "Permission denied" });
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async updateCompleteProgress(req, res, next) {
    //TODO: user authentication
    const { id } = req.params;
    const { userId } = req.body;

    try {
      const checkProcess = await Transaction.findOne({
        _id: ObjectId(id),
        dealer: ObjectId(userId),
      });
      if (checkProcess.isFilled && checkProcess.isPaid && checkProcess.isSent) {
        const updateProcess = await Transaction.findByIdAndUpdate(
          id,
          { isCompleted: true },
          { runValidators: true, new: true }
        );
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
}
