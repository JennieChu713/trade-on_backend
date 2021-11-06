import express from "express";
import Transaction from "../../models/transaction.js";
import Post from "../../models/post.js";
import User from "../../models/user.js";
import mongoose from "mongoose";

const router = express.Router();

// READ all transactions (from a user)
router.get("/", async (req, res) => {
  //TODO: user authentication
  try {
    const allTrans = await Transaction.find()
      .lean()
      .select("-__v")
      .populate({ path: "post", select: "itemName id owner quantity" })
      .exec(); // TODO: find user from ownerId || dealerId
    allTrans.forEach((tran) => {
      const newCreateAt = new Date(tran.createdAt);
      const newUpdateAt = new Date(tran.updatedAt);
      tran.createdAt = newCreateAt.toLocaleString();
      tran.updatedAt = newUpdateAt.toLocaleString();
    });
    res.status(200).json({ message: "success", allTrans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// READ start a deal transaction - step 0: get dealer info for owner
router.get("/post/:id/request", async (req, res) => {
  const { user } = req.query;
  const getDealer = await User.findById(user).select(
    "-__v -createdAt -updatedAt"
  );
  if (!getDealer) {
    return res
      .status(200)
      .json({ message: "the user you are looking for does not exist." });
  }
  res.status(200).json({ message: "success", getDealer });
});

// CREATE start a deal transaction - step 1 :send from owner (add owner and postId)
router.post("/post/:id", async (req, res) => {
  //TODO: user authentication
  const { id } = req.params; // postId
  const { amount, userId } = req.body; // 贈送數量, 刊登者ID
  const { ObjectId } = mongoose.Types;

  // check if amount is acceptable
  if (!amount) {
    return res.status(200).json({ message: "amount can not be 0!" });
  }
  const presentDeals = await Transaction.find({ post: ObjectId(id) })
    .lean()
    .populate("post", "quantity givenAmount")
    .exec();
  const { quantity, givenAmount } = presentDeals[0].post;
  let total = 0;
  if (presentDeals.length) {
    presentDeals.forEach((deal) => {
      total += deal.amount;
    });
    total += givenAmount;
    if (quantity - total < amount) {
      return res
        .status(200)
        .json({ message: "amount is over remain quantity." });
    }
  }

  try {
    // check if userId and post's owner is equivalent
    const checkPostOwner = await Post.findById({ id, owner: ObjectId(userId) });
    if (!checkPostOwner) {
      return res.status(200).json({ message: "permission denied" });
    }

    // create
    const newTrans = await Transaction.create({
      amount,
      post: id,
      owner: userId,
    });
    if (newTrans) {
      res.status(200).json({ message: "success", newTrans });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ a deal transaction info from owner - step 2: get for dealer
router.get("/post/:id/accept", async (req, res) => {
  // TODO: user authentication
  const { user } = req.query; //索取者 ID
  const { id } = req.params; // 刊登 ID
  const { ObjectId } = mongoose.Types;
  try {
    const getTrans = await Transaction.findOne({ post: ObjectId(id) })
      .lean()
      .select("-__v")
      .populate("post", "tradingOptions")
      .exec(); //await Transaction.find({ post: ObjectId(id), dealer: ObjectId(user)})
    res.status(200).json({ message: "success", getTrans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a deal transaction - step 3: from dealer (add dealerId and dealMethod)
router.put("/post/:id", async (req, res) => {
  const { user } = req.query; //索取者 ID
  const { id } = req.params; // postId
  const { ownerId, tradingOptions } = req.body; // 刊登者ID, 選定的交易方式
  const { ObjectId } = mongoose.Types;
  try {
    const checkTrans = await Transaction.findOne({
      post: ObjectId(id),
      owner: ObjectId(ownerId),
    })
      .lean()
      .populate("post", "tradingOptions")
      .exec();
    if (!checkTrans) {
      return res.status(200).json({ message: "permission denied." });
    }

    // get dealMethod
    const dealMethod = tradingOptions.faceToFace
      ? { ...checkTrans.post.tradingOptions.faceToFace }
      : { ...checkTrans.post.tradingOptions.convenientStore };
    const { _id } = checkTrans;
    await Transaction.findByIdAndUpdate(
      _id,
      { dealer: user, dealMethod },
      { runValidators: true, new: true }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ a transaction
router.get("/:id", async (req, res) => {
  // TODO: user authentication
  const { id } = req.params;
  try {
    const trans = await Transaction.findById(id).lean().populate("post").exec();
    if (trans) {
      res.status(200).json({ message: "success", trans });
    } else {
      return res
        .status(200)
        .json({ error: "The deal you are looking for does not exist." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE transaction - filling sending info and isFilled
router.put("/filling-info/:id", async (req, res) => {
  //TODO: user authentication
  const { id } = req.params;
  const { name, cellPhone, storeCode, storeName } = req.body;
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
    // Transaction.findByOneAndUpdate({id, owner:userId, dealer: dealerId},dataStructure,{ runValidators: true, new: true })
    const updateProcess = await Transaction.findByIdAndUpdate(
      id,
      dataStructure,
      { runValidators: true, new: true }
    );
    if (updateProcess) {
      res.status(200).json(updateProcess);
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// UPDATE transaction - filling sending info and isFilled
router.put("/payment/:id", async (req, res) => {
  //TODO: user authentication
  const { id } = req.params;
  //TODO: if user(dealerId) does not have account information,
  const { accountName, accountNum, bankCode, bankName } = req.body;
  try {
    const checkProcess = await Transaction.findById(id);
    if (checkProcess.isFilled) {
      // const dataStructure = {
      //   account: {
      //     accountName,
      //     accountNum,
      //     bankCode,
      //     bankName,
      //   },
      // };
      const updateProcess = await Transaction.findByIdAndUpdate(
        id,
        { isPayed: true, isCancelable: false },
        { runValidators: true, new: true }
      );
      if (updateProcess) {
        res.status(200).json(updateProcess);
      }
    } else {
      return res.status(200).json({ error: "Unpermitted Process" });
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// UPDATE transaction - is sendout
router.put("/sendout/:id", async (req, res) => {
  //TODO: user authentication
  const { id } = req.params;
  try {
    const checkProcess = await Transaction.findById(id);
    if (checkProcess.isFilled && checkProcess.isPayed) {
      const updateProcess = await Transaction.findByIdAndUpdate(
        id,
        { isSent: true },
        { runValidators: true, new: true }
      );
      const updatePost = await Post.findByIdAndUpdate(
        { _id: updateProcess.post },
        { givenAmount: { $add: ["$givinAmount", updateProcess.amount] } },
        { runValidators: true, new: true }
      );
      if (updateProcess) {
        res.status(200).json({ message: "success", updateProcess });
      }
    } else {
      return res.status(200).json({ error: "Process denied" });
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// UPDATE transaction - is complete
router.put("/complete/:id", async (req, res) => {
  //TODO: user authentication
  const { id } = req.params;
  try {
    const checkProcess = await Transaction.findById(id);
    if (checkProcess.isFilled && checkProcess.isPayed && checkProcess.isSent) {
      const updateProcess = await Transaction.findByIdAndUpdate(
        id,
        { isCompleted: true },
        { runValidators: true, new: true }
      );
      if (updateProcess) {
        res.status(200).json({ message: "success", updateProcess });
      }
    } else {
      return res.status(200).json({ error: "Process denied" });
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// export default router;
