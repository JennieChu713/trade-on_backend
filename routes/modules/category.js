import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";

const { checkToken, permissionCheck } = AuthenticationMiddleware;

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

// READ a category (for editing present data)
router.get("/:id", checkToken, permissionCheck, getOneCategory);

// CREATE a Category
router.post("/new", checkToken, permissionCheck, createCategory);

// UPDATE a Category
router.put("/:id", checkToken, permissionCheck, updateCategory);

// DELETE a Category
router.delete("/:id", checkToken, permissionCheck, deleteCategory);

export default router;
