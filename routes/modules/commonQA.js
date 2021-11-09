import express from "express";
import CommonQAsController from "../../controllers/commonQAs.js";

const {
  getAllCommonQAs,
  getOneCommonQA,
  createCommonQA,
  updateCommonQA,
  deleteCommonQA,
} = CommonQAsController;

const router = express.Router();

// READ all commonQAs
router.get("/all", getAllCommonQAs);

// READ a commonQA (for editing present data)
router.get("/:id", getOneCommonQA);

// CREATE a commonQA
router.post("/new", createCommonQA);

//UPDATE a commonQA
router.put("/:id", updateCommonQA);

// DELETE a commonQA
router.delete("/:id", deleteCommonQA);

export default router;
