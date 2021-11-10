import express from "express";

import PostControllers from "../../controllers/posts.js";
const { getAllPosts, getOnePost, createPost, updatePost, deletePost } =
  PostControllers;

const router = express.Router();

// READ all posts
router.get("/all", getAllPosts);

// READ a post
router.get("/:id", getOnePost);

// CREATE a post
router.post("/new", createPost);

//UPDATE a post
router.put("/:id", updatePost);

// DELETE a post
router.delete("/:id", deletePost);

export default router;
