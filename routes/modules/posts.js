import express from "express";
import {
  authenticator,
  isPostAuthor,
  isPostPermitted,
  hasQueryUser,
} from "../../middleware/auth.js";

import PostControllers from "../../controllers/posts.js";
const { getAllPosts, getOnePost, createPost, updatePost, deletePost } =
  PostControllers;

const router = express.Router();

// READ all posts
router.get("/all", hasQueryUser, getAllPosts);

// READ a post
router.get("/:id", getOnePost);

// CREATE a post
router.post("/new", authenticator, isPostPermitted, createPost);

//UPDATE a post
router.put("/:id", authenticator, isPostAuthor, updatePost);

// DELETE a post
router.delete("/:id", authenticator, isPostAuthor, deletePost);

export default router;
