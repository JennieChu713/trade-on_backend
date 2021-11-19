import express from "express";
import { authenticator, isAdmin } from "../../middleware/auth.js";
import CommonQAsControllers from "../../controllers/commonQAs.js";

const {
  getAllCommonQAs,
  getOneCommonQA,
  createCommonQA,
  updateCommonQA,
  deleteCommonQA,
} = CommonQAsControllers;

const router = express.Router();

// READ all commonQAs
router.get("/all", getAllCommonQAs);

// READ a commonQA (for editing present data)
router.get("/:id", authenticator, isAdmin, getOneCommonQA);

// CREATE a commonQA
router.post("/new", authenticator, isAdmin, createCommonQA);

//UPDATE a commonQA
router.put("/:id", authenticator, isAdmin, updateCommonQA);

// DELETE a commonQA
router.delete("/:id", authenticator, isAdmin, deleteCommonQA);

export default router;
