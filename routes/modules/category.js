import express from "express";
import Category from "../../models/category.js";

const router = express.Router();

// READ all Categories
router.get("/", async (req, res) => {
  try {
    const allCategories = await Category.find();
    res.status(200).json(allCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a Category
router.post("/", async (req, res) => {
  // TODO: user authentication(admin)
  const { categoryName } = req.body;
  try {
    const addCategory = await Category.create({ categoryName });
    if (addCategory) {
      res.status(200).json(addCategory);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//UPDATE a Category
router.put("/:id", async (req, res) => {
  // TODO: user authentication(admin)
  const { id } = req.params;
  const { categoryName } = req.body;
  try {
    const editCategory = await Category.findByIdAndUpdate(
      id,
      { categoryName },
      { runValidators: true, new: true }
    );
    if (editCategory) {
      res.status(200).json(editCategory);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a Category
router.delete("/:id", async (req, res) => {
  // TODO: user authentication(admin)
  const { id } = req.params;
  try {
    // TODO: move stored items from POST to "未分類" Category
    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
