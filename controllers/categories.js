import Category from "../models/category.js";
import Post from "../models/post.js";
import mongoose from "mongoose";

// paginate option setup function
import { optionsSetup, paginateObject } from "../utils/paginateOptionSetup.js";
import { errorResponse } from "../utils/errorMsgs.js";

// triming word value with no spaces
function trimWords(words) {
  let result;
  let trimWords = words.trim();
  for (char of trimWords) {
    if (char !== " ") {
      result += char;
    }
  }
  return result;
}

const { ObjectId } = mongoose.Types;

export default class CategoryControllers {
  static async getAllCategories(req, res, next) {
    const { sortBy } = req.query;
    let updatedAt;
    switch (sortBy) {
      case "asc":
        updatedAt = 1;
        break;
      case "desc":
        updatedAt = -1;
        break;
      default:
        updatedAt = 1;
        break;
    }

    try {
      const categories = await Category.find().sort({
        updatedAt,
      });

      if (!categories.length) {
        return res.status(200).json({
          message: "Category is empty in present - 目前尚未建立分類資料",
        });
      }

      res.status(200).json({
        message: "success",
        categories,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getOneCategory(req, res, next) {
    try {
      const { id } = req.params;
      const getCategory = await Category.findById(id);

      if (!getCategory) {
        errorResponse(res, 404);
        return;
      }

      res.status(200).json({ message: "success", category: getCategory });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getRelatedPosts(req, res, next) {
    const { id } = req.params;
    const { page, size } = req.query;
    const options = optionsSetup(page, size, "-tradingOptions -isPublic", {
      path: "owner category",
      select: "nickname email categoryName",
    });
    const { limit } = options;
    try {
      const getRelatedPosts = await Post.paginate(
        { category: ObjectId(id) },
        options
      );

      if (!getRelatedPosts) {
        return res.status(200).json({
          message: "No related post in present. - 該分類目前尚未有相關的刊登",
        });
      }

      const { totalDocs, docs, page } = getRelatedPosts;
      const paginate = paginateObject(totalDocs, limit, page);
      const relatedPosts = docs;

      res.status(200).json({ message: "success", paginate, relatedPosts });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createCategory(req, res, next) {
    let { categoryName } = req.body;
    categoryName = trimWords(categoryName);
    try {
      // check if category exist
      const categoryExist = await Category.findOne({ categoryName });

      if (categoryExist) {
        return res
          .status(200)
          .json({ message: `${categoryName} already exist. - 該分類已存在` });
      }

      // create new category
      const addCategory = await Category.create({ categoryName });
      if (addCategory) {
        res.status(200).json({ message: "success", new: addCategory });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateCategory(req, res, next) {
    const { id } = req.params;
    let { categoryName, compareId } = req.body;
    categoryName = trimWords(categoryName);
    try {
      // check if category name is duplicated
      const categoryExist = await Category.findOne({ categoryName }).lean();
      if (categoryExist) {
        return res
          .status(200)
          .json({ message: `${categoryName} already exist. - 該分類已存在` });
      }

      // check if category name is "未分類"；因為是視為原始分類，所以先暫時設定為不能透過 client 端新增或編輯成"未分類"的限制
      if (categoryName === "未分類") {
        return res.status(403).json({
          message:
            "edit forbidden: This is a primary category, it can not be edit. - 該分類不可更改",
        });
      }

      // check if the param id is identical to compareId
      if (id === compareId) {
        // update category name
        const editCategory = await Category.findByIdAndUpdate(
          id,
          { categoryName },
          { runValidators: true, new: true }
        );
        if (editCategory) {
          res.status(200).json({ message: "success", update: editCategory });
        }
      } else {
        return res.status(200).json({ message: "permission denied." });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteCategory(req, res, next) {
    const { id } = req.params;
    try {
      const categoryExist = await Category.findById(id).lean();
      if (!categoryExist) {
        errorResponse(res, 404);
        return;
      }

      // check if primary category "未分類" exist
      const categoryName = "未分類";
      let primaryCategory = await Category.findOne({ categoryName }).lean();
      if (!primaryCategory) {
        // create primary category if not exist
        primaryCategory = await Category.create({ categoryName });
      }
      if (id === primaryCategory._id) {
        return res.status(403).json({
          message:
            "deletion forbidden: This is a primary category, it can not be delete. - 該分類不可刪除",
        });
      }

      const relatedPosts = await Post.find({ category: ObjectId(id) });
      if (relatedPosts.length) {
        relatedPosts.forEach(async (post) => {
          const checkUpdatePosts = await Post.updateOne(
            { _id: post._id },
            { category: ObjectId(primaryCategory._id) },
            { runValidators: true, new: true }
          );
        });
      }

      //if no related posts, delete the category
      await Category.findByIdAndDelete(id);
      res.status(200).json({ message: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
