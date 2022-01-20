import mongoose from "mongoose";

import Post from "../models/post.js";
import Category from "../models/category.js";
import ImgurAPIs from "../utils/imgurAPI.js";

import { optionsSetup, paginateObject } from "../utils/paginateOptionSetup.js";
import { errorResponse } from "../utils/errorMsgs.js";

const { ObjectId } = mongoose.Types;
const { uploadToImgur, deleteImage } = ImgurAPIs;

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
        select: "email nickname avatarUrl.imgUrl categoryName",
      });

      if (!post) {
        errorResponse(res, 404);
        return;
      }

      if (!post.tradingOptions.faceToFace.region) {
        post.tradingOptions.faceToFace = undefined;
      }

      res.status(200).json({ message: "success", post });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // CREATE a post
  static async createPost(req, res, next) {
    const obj = JSON.parse(JSON.stringify(req.body)); // get rid of [Object: null prototype] in case
    const { itemName, itemStatus, description, region, district, categoryId } =
      obj;
    let { quantity, tradingOptions } = obj;

    if (!tradingOptions || !tradingOptions.length) {
      errorResponse(res, 400);
      return;
    }

    if (!quantity) {
      quantity = 1;
    }

    const dataStructure = {
      itemName,
      quantity,
      itemStatus,
      description,
      imgUrls: res.locals.imgs,
      category: ObjectId(categoryId),
      author: ObjectId(res.locals.user),
    };

    if (typeof tradingOptions === "string") {
      tradingOptions = [tradingOptions];
    }

    const selectedOptions = {
      selectedMethods: [],
    };

    if (tradingOptions.indexOf("面交") > -1 && region && district) {
      selectedOptions.faceToFace = { region, district };
    } else {
      if (tradingOptions.indexOf("面交") > -1) {
        tradingOptions.splice(tradingOptions.indexOf("面交"), 1);
      }
    }
    selectedOptions.selectedMethods = [...tradingOptions];

    dataStructure.tradingOptions = selectedOptions;
    try {
      const checkCategory = await Category.findById(categoryId).lean();
      if (!checkCategory) {
        errorResponse(res, 404);
        return;
      }

      const addPost = await Post.create(dataStructure);
      for (let i = 0; i < addPost.imgUrls.length; i++) {
        addPost.imgUrls[i].deleteHash = undefined;
      }

      res.status(200).json({ message: "success", new: addPost });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // UPDATE a post
  static async updatePost(req, res, next) {
    const { id } = req.params;
    const obj = JSON.parse(JSON.stringify(req.body)); // get rid of [Object: null prototype] in case
    const {
      itemName,
      itemStatus,
      description,
      region,
      district,
      categoryId,
      postId,
    } = obj;
    let { imgUrl, quantity, tradingOptions } = obj;

    if (id !== postId) {
      errorResponse(res, 400);
      return;
    }

    if (!tradingOptions || !tradingOptions.length) {
      errorResponse(res, 400);
      return;
    }

    if (!quantity) {
      quantity = 1;
    }

    const blankFields = {};
    const dataStructure = {
      itemName,
      quantity,
      itemStatus,
      category: ObjectId(categoryId),
    };

    if (description) {
      dataStructure.description = description;
    } else {
      blankFields.description = "";
    }

    if (typeof tradingOptions === "string") {
      tradingOptions = [tradingOptions];
    }

    const selectedOptions = {
      selectedMethods: [],
    };

    if (tradingOptions.indexOf("面交") > -1 && region && district) {
      selectedOptions.faceToFace = { region, district };
    } else {
      if (tradingOptions.indexOf("面交") > -1) {
        tradingOptions.splice(tradingOptions.indexOf("面交"), 1);
      }
      blankFields.faceToFace = "";
    }

    selectedOptions.selectedMethods = [...tradingOptions];

    dataStructure.tradingOptions = selectedOptions;

    if (typeof imgUrl === "string") {
      imgUrl = [imgUrl];
    } else if (!imgUrl) {
      imgUrl = [];
    }

    try {
      const checkCategory = await Category.findById(categoryId).lean();
      if (!checkCategory) {
        errorResponse(res, 404);
        return;
      }

      const checkImgs = await Post.findById(id).populate("imgUrls.deleteHash");
      let reservedImgs = checkImgs.slice(0);
      for (let i = 0; i < checkImgs.imgUrls.length; i++) {
        if (imgUrl.indexOf(checkImgs.imgUrls[i].imgUrl) === -1) {
          if (checkImgs.imgUrls[i].deleteHash) {
            let { deleteHash } = checkImgs.imgUrls[i];
            await deleteImage(res.locals.imgurToken, deleteHash);
          }
          reservedImgs.imgUrls.splice(i, 1);
        }
      }

      dataStructure.imgUrls = res.locals.imgs
        ? reservedImgs.imgUrls.concat(res.locals.imgs)
        : reservedImgs.imgUrls;

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

      for (let j = 0; j < updatePost.imgUrls.length; j++) {
        updatePost.imgUrls[j].deleteHash = undefined;
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
      let getDeleteHashes = await Post.findById(id).populate(
        "+imgUrls.deleteHash"
      );
      for (let i = 0; i < getDeleteHashes.imgUrls.length; i++) {
        if (getDeleteHashes.imgUrls[i].deleteHash) {
          let { deleteHash } = getDeleteHashes.imgUrls[i];
          await deleteImage(res.locals.imgurToken, deleteHash);
        }
      }

      await Post.findByIdAndDelete(id);

      res.status(200).json({ message: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
