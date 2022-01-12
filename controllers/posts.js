import mongoose from "mongoose";

import Post from "../models/post.js";
import Category from "../models/category.js";
import ImgurAPIs from "../utils/imgurAPI.js";

import { optionsSetup, paginateObject } from "../utils/paginateOptionSetup.js";
import { errorResponse } from "../utils/errorMsgs.js";

const { ObjectId } = mongoose.Types;
const { uploadToImgur, deleteImage } = ImgurAPIs;

function getBase64(str) {
  const arr = str.split(",");
  return arr[1];
}

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
      ? { author: ObjectId(user), ...publicValue }
      : publicValue;
    const selecting = "-tradingOptions";
    //const selecting = user ? "-tradingOptions" : "-tradingOptions -isPublic";
    const options = optionsSetup(page, size, selecting, {
      path: "author category",
      select: "nickname email categoryName",
    });
    const { limit } = options;

    try {
      const getAllPosts = await Post.paginate(filterQuery, options);

      if (!getAllPosts.totalDocs) {
        return res
          .status(200)
          .json({ message: "No post in present. - 目前尚未建立刊登資料" });
      }

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
        path: "author category",
        select: "email nickname avatarUrl categoryName",
      });

      if (!post) {
        errorResponse(res, 404);
        return;
      }

      if (post) {
        if (!post.tradingOptions.faceToFace.region) {
          post.tradingOptions.faceToFace = undefined;
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
      tradingOptions, // array contain strings
      region,
      district,
      imgUrl,
      categoryId,
    } = req.body;

    if (!tradingOptions.length) {
      errorResponse(res, 400);
      return;
    }

    let allImgUrls = [];
    if (imgUrl && imgUrl.length) {
      if (typeof imgUrl !== "string") {
        allImgUrls = [...imgUrl];
      } else if (typeof imgUrl === "string") {
        allImgUrls.push(imgUrl);
      }
    }
    //TODO: request give file.arrayBuffer from react-image-uploading as to turn into base64 at backend and save to imgur

    const dataStructure = {
      itemName,
      quantity,
      itemStatus,
      description,
      imgUrls: allImgUrls,
      category: ObjectId(categoryId),
      author: ObjectId(res.locals.user),
    };

    const selectedOptions = {
      selectedMethods: [...tradingOptions],
    };

    if (tradingOptions.indexOf("面交") > -1 && region && district) {
      selectedOptions.faceToFace = { region, district };
    }

    dataStructure.tradingOptions = selectedOptions;
    try {
      const checkCategory = await Category.findById(categoryId).lean();
      if (!checkCategory) {
        errorResponse(res, 404);
        return;
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
      tradingOptions, // array contain strings
      region,
      district,
      imgUrl,
      categoryId,
      postId,
    } = req.body;

    if (id !== postId) {
      errorResponse(res, 400);
      return;
    }

    let allImgUrls = [];
    if (imgUrl && imgUrl.length) {
      if (typeof imgUrl !== "string") {
        allImgUrls = [...imgUrl];
      } else if (typeof imgUrl === "string") {
        allImgUrls.push(imgUrl);
      }
    }

    const blankFields = {};
    const dataStructure = {
      itemName,
      quantity,
      itemStatus,
      imgUrls: allImgUrls,
      category: ObjectId(categoryId),
    };

    if (description) {
      dataStructure.description = description;
    } else {
      blankFields.description = "";
    }

    const selectedOptions = {
      selectedMethods: [...tradingOptions],
    };

    if (tradingOptions.indexOf("面交") > -1 && region && district) {
      selectedOptions.faceToFace = { region, district };
    } else {
      blankFields.faceToFace = "";
    }

    dataStructure.tradingOptions = selectedOptions;
    try {
      const checkCategory = await Category.findById(categoryId).lean();
      if (!checkCategory) {
        errorResponse(res, 404);
        return;
      }

      const updatePost = await Post.findByIdAndUpdate(
        id,
        { ...dataStructure, $unset: blankFields },
        {
          runValidators: true,
          new: true,
        }
      );

      if (!updatePost.tradingOptions.faceToFace.region) {
        updatePost.tradingOptions.faceToFace = undefined;
      }
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
