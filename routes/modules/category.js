import express from "express";

import CategoryControllers from "../../controllers/categories.js";
const {
  getAllCategories,
  getOneCategory,
  getRelatedPosts,
  createCategory,
  updateCategory,
  deleteCategory,
} = CategoryControllers;

const router = express.Router();

// READ all Categories
router.get("/all", getAllCategories);

//READ a category (for editing present data)
router.get("/:id", getOneCategory);

// READ a category with related posts
router.get("/:id/posts", getRelatedPosts);

// CREATE a Category
router.post("/new", createCategory);

// UPDATE a Category
router.put("/:id", updateCategory);

// DELETE a Category
router.delete("/:id", deleteCategory);

export default router;
