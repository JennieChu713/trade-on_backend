import Post from "../models/post.js";
import mongoose from "mongoose";
import {
  optionsSetup,
  paginateObject,
} from "../utils/paginateOptionSetup.common.js";

const { ObjectId } = mongoose.Types;

export default class PostControllers {
  // READ all posts, or related posts of user
  static async getAllPosts(req, res, next) {
    const { page, size, user } = req.query;
    const filterQuery = user
      ? { owner: ObjectId(user), isPublic: true }
      : { isPublic: true };
    const options = optionsSetup(
      page,
      size,
      "-tradingOptions -isPublic -description",
      {
        path: "owner category",
        select: "nickname email categoryName",
      }
    );
    const { limit } = options;
    try {
      const getAllPosts = await Post.paginate(filterQuery, options);
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
        select: "email nickname categoryName",
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
      storeFee,
      region,
      district,
      imgUrl,
      categoryId,
    } = req.body;

    const imgUrls = [];
    if (imgUrl) {
      imgUrls.push(imgUrl);
    }

    const dataStructure = {
      itemName,
      quantity,
      itemStatus,
      description,
      imgUrls,
      category: ObjectId(categoryId),
      owner: ObjectId(res.locals.user._id),
    };
    let tradingOptions = {};
    if ((storeCode && storeName) || (region && district)) {
      if (storeCode && storeName) {
        tradingOptions.convenientStore = {
          storeCode,
          storeName,
          fee: storeFee,
        };
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
      imgUrl,
      categoryId,
      postId,
    } = req.body;

    if (id !== postId) {
      return res.status(401).json({ error: "Permission denied" });
    }

    const imgUrls = [];
    if (imgUrl) {
      imgUrls.push(imgUrl);
    }

    const dataStructure = {
      itemName,
      quantity,
      itemStatus,
      description,
      imgUrls,
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
      const updatePost = await Post.findByIdAndUpdate(
        id,
        { ...dataStructure },
        {
          runValidators: true,
          new: true,
        }
      );
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
