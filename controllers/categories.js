import Category from "../models/category.js";
import Post from "../models/post.js";
import mongoose from "mongoose";

// paginate option setup function
import { optionsSetup, paginateObject } from "../utils/paginateOptionSetup.js";

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
      const { ObjectId } = mongoose.Types;
      const getRelatedPosts = await Post.paginate(
        { category: ObjectId(id) },
        options
      );
      const { totalDocs, docs, page } = getRelatedPosts;
      const paginate = paginateObject(totalDocs, limit, page);
      const relatedPosts = docs;

      res.status(200).json({ message: "success", paginate, relatedPosts });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createCategory(req, res, next) {
    const { categoryName } = req.body;
    try {
      // check if category exist
      const categoryExist = await Category.findOne({ categoryName });
      if (categoryExist) {
        return res
          .status(200)
          .json({ message: `${categoryName} already exist.` });
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
    const { categoryName, compareId } = req.body;
    try {
      // check if category name is duplicated
      const categoryExist = await Category.findOne({ categoryName });
      if (categoryExist) {
        return res
          .status(200)
          .json({ message: `${categoryName} already exist.` });
      }

      // check if category name is "未分類"；因為是視為原始分類，所以先暫時設定為不能透過 client 端新增或編輯成"未分類"的限制
      if (categoryName === "未分類") {
        return res.status(403).json({
          message:
            "edit forbidden: This is a primary category, it can not be edit.",
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
    const { ObjectId } = mongoose.Types;
    const { id } = req.params;
    try {
      // check if primary category "未分類" exist
      const categoryName = "未分類";
      let primaryCategory = await Category.findOne({ categoryName });
      if (!primaryCategory) {
        // create primary category if not exist
        primaryCategory = await Category.create({ categoryName });
      }
      if (id === primaryCategory._id) {
        return res.status(403).json({
          message:
            "deletion forbidden: This is a primary category, it can not be delete.",
        });
      }

      const categoryExist = await Category.findById(id);
      if (!categoryExist) {
        return res.status(200).json({
          message: "The category you are attend to delete does not exist.",
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

      //if not related posts, delete the category
      await Category.findByIdAndDelete(id);
      res.status(200).json({ message: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
