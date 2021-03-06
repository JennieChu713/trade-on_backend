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
  for (let char of trimWords) {
    if (!result) {
      result = char;
    } else if (char !== " ") {
      result += char;
    }
  }
  return result;
}

const { ObjectId } = mongoose.Types;

export default class CategoryControllers {
  static async getAllCategories(req, res) {
    const { sortBy } = req.query;
    let createdAt;
    switch (sortBy) {
      case "asc":
        createdAt = 1;
        break;
      case "desc":
        createdAt = -1;
        break;
      default:
        createdAt = 1;
        break;
    }

    try {
      const categories = await Category.find().sort({
        createdAt,
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

  static async getOneCategory(req, res) {
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

  static async getRelatedPosts(req, res) {
    const { id } = req.params;
    const { page, size } = req.query;
    const options = optionsSetup(page, size, "-tradingOptions -isPublic", {
      path: "author category",
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

  static async createCategory(req, res) {
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

  static async updateCategory(req, res) {
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
        return res.status(200).json({
          message: "the object you are trying to edit does not match.",
        });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteCategory(req, res) {
    const { id } = req.params;
    try {
      const categoryExist = await Category.findById(id).lean();
      if (!categoryExist) {
        errorResponse(res, 404);
        return;
      }

      // check if primary category "其他" exist
      const categoryName = "其他";
      let primaryCategory = await Category.findOne({ categoryName }).lean();
      if (!primaryCategory) {
        // create primary category if not exist
        primaryCategory = await Category.create({ categoryName });
      }

      const relatedPosts = await Post.find({ category: ObjectId(id) });
      if (relatedPosts.length) {
        for (let post of relatedPosts) {
          post.category = ObjectId(primaryCategory._id);
          await post.save();
        }
      }

      //if no related posts, delete the category
      await Category.findByIdAndDelete(id);
      res.status(200).json({ message: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
