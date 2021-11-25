import express from "express";

import AuthenticationMiddleware from "../../middleware/auth.js";

const {
  authenticator,
  isPostAuthor,
  postPermission,
  hasQueryUser,
  isAdminOrOwner,
  hasQueryPublic,
} = AuthenticationMiddleware;

import PostControllers from "../../controllers/posts.js";
import post from "../../models/post.js";
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
router.post("/new", authenticator, postPermission, createPost);

// READ a post
router.get("/:id", getOnePost);

// UPDATE a post status
router.put(
  "/:id/status",
  authenticator,
  postPermission,
  isAdminOrOwner,
  updatePostStatus
);

//UPDATE a post
router.put("/:id", authenticator, isPostAuthor, updatePost);

// DELETE a post
router.delete("/:id", authenticator, isPostAuthor, deletePost);

export default router;
