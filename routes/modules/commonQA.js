import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";
import ValidationMiddleware from "../../middleware/validation.js";

const { checkToken, permissionCheck } = AuthenticationMiddleware;
const { idValidate } = ValidationMiddleware;
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
router.get("/:id", checkToken, permissionCheck, idValidate, getOneCommonQA);

//UPDATE a commonQA
router.put("/:id", checkToken, permissionCheck, idValidate, updateCommonQA);

// DELETE a commonQA
router.delete("/:id", checkToken, permissionCheck, idValidate, deleteCommonQA);

export default router;
