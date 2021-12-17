import Post from "../models/post.js";
import Category from "../models/category.js";
import mongoose from "mongoose";
import { optionsSetup, paginateObject } from "../utils/paginateOptionSetup.js";

const { ObjectId } = mongoose.Types;

export default class PostControllers {
  // READ all posts, or related posts of user
  static async getAllPosts(req, res, next) {
    const { page, size, user, isPublic } = req.query;

    const publicValue = {};
    switch (isPublic) {
      case "true":
        publicValue.isPublic = true;
        break;
      case "false":
        publicValue.isPublic = false;
        break;
    }

    const filterQuery = user
      ? { owner: ObjectId(user), ...publicValue }
      : publicValue;
    const selecting = "-tradingOptions";
    //const selecting = user ? "-tradingOptions" : "-tradingOptions -isPublic";
    const options = optionsSetup(page, size, selecting, {
      path: "owner category",
      select: "nickname email categoryName",
    });
    const { limit } = options;

    try {
      const getAllPosts = await Post.paginate(filterQuery, options);
      const { totalDocs, docs } = getAllPosts;
      const current = getAllPosts.page;
      const paginate = paginateObject(totalDocs, limit, current);
      const allPosts = docs;
      if (allPosts) {
        res.status(200).json({ message: "success", paginate, allPosts });
      }
    } catch (err) {
      console.log(err);
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
        if (!post.tradingOptions.faceToFace.region) {
          post.tradingOptions.faceToFace = undefined;
        }
        if (!post.tradingOptions.convenientStores.length) {
          post.tradingOptions.convenientStores = undefined;
        }
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
      convenientStores, //array contain string
      region,
      district,
      imgUrl,
      categoryId,
    } = req.body;

    let allImgUrls = [];
    if (imgUrl) {
      if (imgUrl.length && typeof imgUrl !== "string") {
        allImgUrls = [...imgUrl];
      } else if (typeof imgUrl === "string") {
        allImgUrls.push(imgUrl);
      }
    }

    const dataStructure = {
      itemName,
      quantity,
      itemStatus,
      description,
      imgUrls: allImgUrls,
      category: ObjectId(categoryId),
      owner: ObjectId(res.locals.user),
    };
    let tradingOptions = {};
    if (convenientStores && convenientStores.length) {
      tradingOptions.convenientStores = [...convenientStores];
    }

    if (region && district) {
      tradingOptions.faceToFace = { region, district };
    }

    dataStructure.tradingOptions = tradingOptions;
    try {
      const checkCategory = await Category.findById(categoryId).lean();
      if (!checkCategory) {
        return res
          .status(404)
          .json({ error: "The category attempt to assign does not exist." });
      }

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
      convenientStores, //array contain stringify objects
      region,
      district,
      imgUrl,
      categoryId,
      postId,
    } = req.body;

    if (id !== postId) {
      return res.status(401).json({ error: "Permission denied" });
    }

    let allImgUrls = [];
    if (imgUrl.length && typeof imgUrl !== "string") {
      allImgUrls = [...imgUrl];
    } else if (typeof imgUrl === "string") {
      allImgUrls.push(imgUrl);
    }

    const dataStructure = {
      itemName,
      quantity,
      itemStatus,
      description,
      imgUrls: allImgUrls,
      category: ObjectId(categoryId),
    };

    let tradingOptions = {};
    if (convenientStores && convenientStores.length) {
      tradingOptions.convenientStores = [...convenientStores];
    }

    if (region && district) {
      tradingOptions.faceToFace = { region, district };
    }

    dataStructure.tradingOptions = tradingOptions;
    try {
      const checkCategory = await Category.findById(categoryId).lean();
      if (!checkCategory) {
        return res
          .status(404)
          .json({ error: "The category attempt to assign does not exist." });
      }
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

  // UPDATE a post status
  static async updatePostStatus(req, res, next) {
    const { id } = req.params;
    try {
      const checkPost = await Post.findById(id);
      if (checkPost) {
        checkPost.isPublic = !checkPost.isPublic;
      }
      const updatePost = await checkPost.save();
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
