import express from "express";
import Post from "../../models/post.js";
import mongoose from "mongoose";

const router = express.Router();

// READ all posts
router.get("/all", async (req, res) => {
  try {
    const allPosts = await Post.find()
      .lean()
      .select("-__v -createdAt -updatedAt")
      .populate("category", "id, categoryName")
      .exec();
    if (allPosts) {
      res.status(200).json({ message: "success", allPosts });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ a post
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id)
      .lean()
      .select("-__v -createdAt -updatedAt")
      .populate("category", "id categoryName")
      .exec();
    if (post) {
      res.status(200).json({ message: "success", post });
    } else {
      return res
        .status(404)
        .json({ error: "The post you are looking for does not exist." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a post
router.post("/new", async (req, res) => {
  const { ObjectId } = mongoose.Type;
  //TODO: user authentication
  const {
    itemName,
    quantity,
    itemStatus,
    description,
    storeCode,
    storeName,
    region,
    district,
    categoryId,
    userId,
  } = req.body;
  const dataStructure = {
    itemName,
    quantity,
    itemStatus,
    description,
    category: ObjectId(categoryId),
    owner: ObjectId(userId),
  };
  let tradingOptions = {};
  if ((storeCode && storeName) || (region && district)) {
    if (storeCode && storeName) {
      tradingOptions.convenientStore = { storeCode, storeName };
    }
    if (region && district) {
      tradingOptions.faceToFace = { region, district };
    }
  }
  dataStructure.tradingOptions = tradingOptions;
  try {
    const addPost = await Post.create(dataStructure);
    res.status(200).json({ message: "success", new: addPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//UPDATE a post
router.put("/:id", async (req, res) => {
  // TODO: user authentication
  const { id } = req.params;
  const { ObjectId } = mongoose.Types;
  const {
    itemName,
    quantity,
    itemStatus,
    description,
    storeCode,
    storeName,
    region,
    district,
    categoryId,
    userId,
  } = req.body;
  const dataStructure = {
    itemName,
    quantity,
    itemStatus,
    description,
    category: ObjectId(categoryId),
  };
  let tradingOptions = {};
  if ((storeCode && storeName) || (region && district)) {
    if (storeCode && storeName) {
      tradingOptions.convenientStore = { storeCode, storeName };
    }
    if (region && district) {
      tradingOptions.faceToFace = { region, district };
    }
  }
  dataStructure.tradingOptions = tradingOptions;
  try {
    const updatePost = await Post.findOneAndUpdate(
      { _id: id, owner: ObjectId(userId) },
      dataStructure,
      {
        runValidators: true,
        new: true,
      }
    );
    res.status(200).json({ message: "success", update: updatePost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a post
router.delete("/:id", async (req, res) => {
  // TODO: user authentication
  const { id } = req.params;
  try {
    await Post.findByIdAndDelete({ id });
    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
