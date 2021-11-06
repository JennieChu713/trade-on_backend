import express from "express";
import Post from "../../models/post.js";

const router = express.Router();

//READ all posts
router.get("/", async (req, res) => {
  try {
    const allPosts = await Post.find()
      .lean()
      .populate("category", "id, categoryName")
      .exec();
    if (allPosts) {
      res.status(200).json({ message: "success", allPosts });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//READ a post
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id)
      .lean()
      .populate("category", "id, categoryName")
      .exec();
    if (post) {
      res.status(200).json({ message: "success", post });
    } else {
      return res
        .status(404)
        .json({ error: "The post you are looking for does not exist." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//CREATE a post
router.post("/", async (req, res) => {
  //TODO: user authentication
  //const userId = user._id
  const {
    itemName,
    quantity,
    itemStatus,
    description,
    storeCode,
    storeName,
    region,
    district,
    categoryId,
    userId,
  } = req.body;
  const dataStructure = {
    itemName,
    quantity,
    itemStatus,
    description,
    category: categoryId,
    owner: userId,
  };
  let tradingOptions = {};
  if ((storeCode && storeName) || (region && district)) {
    if (storeCode && storeName) {
      tradingOptions.convenientStore = { storeCode, storeName };
    }
    if (region && district) {
      tradingOptions.faceToFace = { region, district };
    }
  }
  dataStructure.tradingOptions = tradingOptions;
  try {
    const addPost = await Post.create(dataStructure);
    if (addPost) {
      res.status(200).json({ message: "success", addPost });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//UPDATE a post
router.put("/:id", async (req, res) => {
  // TODO: user authentication
  const { id } = req.params;
  //const userId = user._id; const {_id} = req.params.id
  const {
    itemName,
    quantity,
    itemStatus,
    description,
    storeCode,
    storeName,
    region,
    district,
    categoryId,
  } = req.body;
  const dataStructure = {
    itemName,
    quantity,
    itemStatus,
    description,
    category: categoryId,
  };
  let tradingOptions = {};
  if ((storeCode && storeName) || (region && district)) {
    if (storeCode && storeName) {
      tradingOptions.convenientStore = { storeCode, storeName };
    }
    if (region && district) {
      tradingOptions.faceToFace = { region, district };
    }
  }
  dataStructure.tradingOptions = tradingOptions;
  try {
    //const updatePost = await Post.findOneAndUpdate({_id: ObjectId(id), userId: userId});
    const updatePost = await Post.findByIdAndUpdate(id, dataStructure, {
      runValidators: true,
      new: true,
    });
    if (updatePost) {
      res.status(200).json({ message: "success", updatePost });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//DELETE a post
router.delete("/:id", async (req, res) => {
  // TODO: user authentication
  const { id } = req.params;
  try {
    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
