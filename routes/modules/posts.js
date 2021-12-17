import express from "express";

import AuthenticationMiddleware from "../../middleware/auth.js";

const {
  checkToken,
  isPostAuthor,
  postPermission,
  hasQueryUser,
  isAdminOrOwner,
  hasQueryPublic,
} = AuthenticationMiddleware;

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
router.post("/new", checkToken, postPermission, createPost);

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
router.put("/:id", checkToken, isPostAuthor, updatePost);

// DELETE a post
router.delete("/:id", checkToken, isPostAuthor, deletePost);

export default router;
