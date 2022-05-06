import express from "express";

import AuthenticationMiddleware from "../../middleware/auth.js";
import UploadImagesMiddleware from "../../middleware/handleMultipleImages.js";
import { uploadCheck } from "../../middleware/multer.js";
import ValidationMiddleware from "../../middleware/validation.js";

const {
  checkToken,
  isPostAuthor,
  postPermission,
  hasQueryUser,
  isAdminOrOwner,
  hasQueryPublic,
} = AuthenticationMiddleware;

const { idValidate, tradingOptionsValidate } = ValidationMiddleware;

const { uploadMulti } = UploadImagesMiddleware;

import PostControllers from "../../controllers/posts.js";
const {
  getAllPosts,
  getOnePost,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
} = PostControllers;

const router = express.Router();

// READ all posts
router.get("/all", hasQueryPublic, hasQueryUser, getAllPosts);

// CREATE a post
router.post(
  "/new",
  checkToken,
  postPermission,
  idValidate,
  tradingOptionsValidate,
  uploadCheck.array("imgUrl", 10),
  uploadMulti,
  createPost
);

// UPDATE a post status
router.put(
  "/:id/status",
  checkToken,
  postPermission,
  isAdminOrOwner,
  idValidate,
  updatePostStatus
);

// READ a post
router.get("/:id", idValidate, getOnePost);

//UPDATE a post
router.put(
  "/:id",
  checkToken,
  idValidate,
  isPostAuthor,
  tradingOptionsValidate,
  uploadCheck.array("imgUrl", 10),
  uploadMulti,
  updatePost
);

// DELETE a post
router.delete("/:id", checkToken, idValidate, isPostAuthor, deletePost);

export default router;
