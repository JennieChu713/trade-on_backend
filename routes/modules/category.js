import express from "express";
import { authenticator, isAdmin } from "../../middleware/auth.js";

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

// READ a category with related posts
router.get("/:id/posts", getRelatedPosts);

//READ a category (for editing present data)
router.get("/:id", authenticator, isAdmin, getOneCategory);

// CREATE a Category
router.post("/new", authenticator, isAdmin, createCategory);

// UPDATE a Category
router.put("/:id", authenticator, isAdmin, updateCategory);

// DELETE a Category
router.delete("/:id", authenticator, isAdmin, deleteCategory);

export default router;
