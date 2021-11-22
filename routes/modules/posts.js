import express from "express";

import AuthenticationMiddleware from "../../middleware/auth.js";

const { authenticator, isPostAuthor, postPermission, hasQueryUser } =
  AuthenticationMiddleware;

import PostControllers from "../../controllers/posts.js";
const { getAllPosts, getOnePost, createPost, updatePost, deletePost } =
  PostControllers;

const router = express.Router();

// READ all posts
router.get("/all", hasQueryUser, getAllPosts);

// CREATE a post
router.post("/new", authenticator, postPermission, createPost);

// READ a post
router.get("/:id", getOnePost);

//UPDATE a post
router.put("/:id", authenticator, isPostAuthor, updatePost);

// DELETE a post
router.delete("/:id", authenticator, isPostAuthor, deletePost);

export default router;
