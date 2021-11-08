import express from "express";
import commonQAsController from "../../controllers/commonQAs";

const {
  getAllCommonQAs,
  getOneCommonQA,
  createCommonQA,
  updateCommonQA,
  deleteCommonQA,
} = commonQAsController;

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
