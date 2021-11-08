import Category from "../models/category.js";
import Post from "../models/post.js";
import mongoose from "mongoose";

export default class CategoryControllers {
  static async getAllCategories(req, res, next) {
    try {
      const allCategories = await Category.find()
        .lean()
        .select("-__v -createdAt -updatedAt");
      res.status(200).json({ message: "success", categories: allCategories });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getOneCategory(req, res, next) {
    try {
      const { id } = req.params;
      const getCategory = await Category.findById(id)
        .lean()
        .select("-__v -createdAt -updatedAt");
      res.status(200).json({ message: "success", category: getCategory });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getRelatedPosts(req, res, next) {
    const { id } = req.params;
    try {
      const { ObjectId } = mongoose.Types;
      const getReplatedPosts = await Post.find({ category: ObjectId(id) })
        .lean()
        .select("-__v -createdAt -updatedAt");

      res
        .status(200)
        .json({ message: "success", relatedPosts: getReplatedPosts });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createCategory(req, res, next) {
    // TODO: user authentication(admin)
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
    // TODO: user authentication(admin)
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
    // TODO: user authentication(admin)
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
      if (relatedPosts) {
        relatedPosts.forEach(async (post, i) => {
          const checkUpdatePosts = await Post.updateOne(
            { _id: post._id },
            { category: ObjectId(primaryCategory._id) },
            { runValidators: true, new: true }
          );

          if (i === relatedPosts.length - 1) {
            await Category.findByIdAndDelete(id);
            return res.status(200).json({ message: "success" });
          }
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
