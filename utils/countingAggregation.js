import mongoose from "mongoose";
import Transaction from "../models/transaction.js";
import Post from "../models/post.js";

const { ObjectId } = mongoose.Types;

export async function presentDeals(postId) {
  // get present transaction deals' total amount as reservedTransAmount
  try {
    let allTrans = await Transaction.aggregate([
      { $match: { post: ObjectId(postId), isCanceled: false } },
      {
        $group: {
          _id: { post: "$post" },
          dealers: { $push: "$dealer" },
          trans: { $push: "$_id" },
          reservedTransAmount: { $sum: "$amount" },
          includedTrans: { $sum: 1 },
        },
      },
    ]);
    return allTrans.length ? allTrans : [{ reservedTransAmount: 0 }];
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function remainAmount(postId) {
  // get post of actual amount as remain
  try {
    return await Post.aggregate([
      { $match: { _id: ObjectId(postId) } },
      {
        $project: {
          _id: 1,
          owner: 1,
          remain: { $subtract: ["$quantity", "$givenAmount"] },
        },
      },
    ]);
  } catch (err) {
    throw new Error(err.message);
  }
}
