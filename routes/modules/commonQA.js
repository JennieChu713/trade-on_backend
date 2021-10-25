import express from "express";
import commonQA from "../../models/commonQA.js";

const router = express.Router();

// READ all commonQAs
router.get("/", async (req, res) => {
  try {
    const allQAs = await commonQA.find();
    res.status(200).json(allQAs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a commonQA
router.post("/", async (req, res) => {
  // TODO: user authentication(admin)
  const { question, answer, imgUrls } = req.body;
  try {
    const newQA = { question, answer };
    const addQA = await commonQA.create(newQA);
    if (addQA) {
      res.status(200).json(addQA);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//UPDATE a commonQA
router.put("/:id", async (req, res) => {
  // TODO: user authentication(admin)
  const { id } = req.params;
  console.log(req.params, id);
  const { question, answer } = req.body;
  try {
    const editQA = await commonQA.findByIdAndUpdate(
      id,
      { question, answer },
      { runValidators: true, new: true }
    );
    if (editQA) {
      res.status(200).json(editQA);
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
    await commonQA.findOneAndDelete(id);
    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
