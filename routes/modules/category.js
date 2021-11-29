import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";

const { authenticator, permissionCheck } = AuthenticationMiddleware;

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
router.get("/:id", getOneCategory);
//router.get("/:id", authenticator, permissionCheck, getOneCategory);

// CREATE a Category
router.post("/new", createCategory);
//router.post("/new", authenticator, permissionCheck, createCategory);

// UPDATE a Category
router.put("/:id", updateCategory);
//router.put("/:id", authenticator, permissionCheck, updateCategory);

// DELETE a Category
router.delete("/:id", deleteCategory);
// router.delete("/:id", authenticator, permissionCheck, deleteCategory);

export default router;
