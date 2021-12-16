import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";

const { checkToken, permissionCheck } = AuthenticationMiddleware;
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

// CREATE a commonQA
router.post("/new", checkToken, permissionCheck, createCommonQA);

// READ a commonQA (for editing present data)
router.get("/:id", checkToken, permissionCheck, getOneCommonQA);

//UPDATE a commonQA
router.put("/:id", checkToken, permissionCheck, updateCommonQA);

// DELETE a commonQA
router.delete("/:id", checkToken, permissionCheck, deleteCommonQA);

export default router;
