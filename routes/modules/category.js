import express from "express";
import Category from "../../models/category.js";
import Post from "../../models/post.js";
import mongoose from "mongoose";

const router = express.Router();

// READ all Categories
router.get("/", async (req, res) => {
  try {
    const allCategories = await Category.find();
    res.status(200).json({ message: "success", allCategories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ a category with related posts
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { ObjectId } = mongoose.Types;
    const getReplatedPosts = await Post.find({ category: ObjectId(id) });
    res.status(200).json({ message: "success", getReplatedPosts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a Category
router.post("/new", async (req, res) => {
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
      res.status(200).json({ message: "success", addCategory });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//UPDATE a Category
router.put("/:id", async (req, res) => {
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
        res.status(200).json({ message: "success", editCategory });
      }
    } else {
      return res.status(200).json({ message: "permission denied." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a Category
router.delete("/:id", async (req, res) => {
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
      return res.status(200).json({ message: "" });
    }

    const relatedPosts = await Post.find({ category: ObjectId(id) });
    if (relatedPosts) {
      relatedPosts.forEach(async (post, i) => {
        const checkUpdatePosts = await Post.updateOne(
          { _id: post._id },
          { category: ObjectId(primaryCategory._id) },
          { runValidators: true, new: true }
        ).lean();

        if (i === relatedPosts.length - 1) {
          await Category.findByIdAndDelete(id);
          res.status(200).json({ message: "success" });
        }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
