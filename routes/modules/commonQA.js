import express from "express";
import commonQA from "../../models/commonQA.js";

const router = express.Router();

// READ all commonQAs
router.get("/all", async (req, res) => {
  try {
    const allQAs = await commonQA
      .find()
      .lean()
      .select("-__v -createdAt -updatedAt");
    res.status(200).json({ message: "success", allQAs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ a commonQA (for editing present data)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const qna = await commonQA
      .findById(id)
      .lean()
      .select("-__v -createdAt -updatedAt");
    res.status(200).json({ message: "success", QnA: qna });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a commonQA
router.post("/new", async (req, res) => {
  // TODO: user authentication(admin)
  const { question, answer, imgUrls } = req.body;
  try {
    const newQA = { question, answer };
    const addQA = await commonQA.create(newQA);
    res.status(200).json({ message: "success", new: addQA });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//UPDATE a commonQA
router.put("/:id", async (req, res) => {
  // TODO: user authentication(admin)
  const { id } = req.params;
  const { question, answer } = req.body;
  try {
    const editQA = await commonQA.findByIdAndUpdate(
      id,
      { question, answer },
      { runValidators: true, new: true }
    );
    if (editQA) {
      res.status(200).json({ message: "success", update: editQA });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a commonQA
router.delete("/:id", async (req, res) => {
  // TODO: user authentication(admin)
  const { id } = req.params;
  try {
    await commonQA.findByIdAndDelete(id);
    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
