import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";
import ValidationMiddleware from "../../middleware/validation.js";

const { checkToken, permissionCheck, isPrimaryCategory } =
  AuthenticationMiddleware;
const { idValidate } = ValidationMiddleware;

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
router.get("/:id/posts", idValidate, getRelatedPosts);

// READ a category (for editing present data)
router.get("/:id", checkToken, permissionCheck, idValidate, getOneCategory);

// CREATE a Category
router.post(
  "/new",
  checkToken,
  permissionCheck,
  isPrimaryCategory,
  createCategory
);

// UPDATE a Category
router.put(
  "/:id",
  checkToken,
  permissionCheck,
  idValidate,
  isPrimaryCategory,
  updateCategory
);

// DELETE a Category
router.delete(
  "/:id",
  checkToken,
  permissionCheck,
  idValidate,
  isPrimaryCategory,
  deleteCategory
);

export default router;
