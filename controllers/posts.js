import Post from "../models/post.js";
import mongoose from "mongoose";
import {
  optionsSetup,
  paginateObject,
} from "../utils/paginateOptionSetup.common.js";

const { ObjectId } = mongoose.Types;

export default class PostControllers {
  // READ all posts
  static async getAllPosts(req, res, next) {
    const { page, size } = req.query;
    const options = optionsSetup(page, size, "-tradingOptions -isPublic", {
      path: "owner category",
      select: "name email categoryName",
    });
    const { limit } = options;
    try {
      const getAllPosts = await Post.paginate({ isPublic: true }, options);
      const { totalDocs, docs, page } = getAllPosts;
      const paginate = paginateObject(totalDocs, limit, page);
      const allPosts = docs;
      if (allPosts) {
        res.status(200).json({ message: "success", paginate, allPosts });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // READ a post
  static async getOnePost(req, res, next) {
    const { id } = req.params;
    try {
      const post = await Post.findById(id).populate({
        path: "owner category",
        select: "email name categoryName",
      });
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
  }

  // CREATE a post
  static async createPost(req, res, next) {
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
    } = req.body;
    const dataStructure = {
      itemName,
      quantity,
      itemStatus,
      description,
      category: ObjectId(categoryId),
      owner: ObjectId(req.user._id),
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
  }

  // UPDATE a post
  static async updatePost(req, res, next) {
    const { id } = req.params;

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
      const updatePost = await Post.findByIdAndUpdate(id, dataStructure, {
        runValidators: true,
        new: true,
      });
      res.status(200).json({ message: "success", update: updatePost });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // DELETE a post
  static async deletePost(req, res, next) {
    const { id } = req.params;
    try {
      await Post.findByIdAndDelete(id);
      res.status(200).json({ message: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
