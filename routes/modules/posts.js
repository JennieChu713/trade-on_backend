import express from "express";

import AuthenticationMiddleware from "../../middleware/auth.js";
import UploadImagesMiddleware from "../../middleware/handleMultipleImages.js";
import { uploadCheck } from "../../middleware/multer.js";

const {
  checkToken,
  isPostAuthor,
  postPermission,
  hasQueryUser,
  isAdminOrOwner,
  hasQueryPublic,
} = AuthenticationMiddleware;

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
router.get("/all", hasQueryUser, hasQueryPublic, getAllPosts);

// CREATE a post
router.post(
  "/new",
  checkToken,
  postPermission,
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
  updatePostStatus
);

// READ a post
router.get("/:id", getOnePost);

//UPDATE a post
router.put(
  "/:id",
  checkToken,
  isPostAuthor,
  uploadCheck.array("imgUrl", 10),
  uploadMulti,
  updatePost
);

// DELETE a post
router.delete("/:id", checkToken, isPostAuthor, deletePost);

export default router;
