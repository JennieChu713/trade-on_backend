import express from "express";
import AuthenticationMiddleware from "../../middleware/auth.js";

const { authenticator, permissionCheck } = AuthenticationMiddleware;
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
router.post("/new", createCommonQA);
// router.post("/new", authenticator, permissionCheck, createCommonQA);

// READ a commonQA (for editing present data)
router.get("/:id", getOneCommonQA);
// router.get("/:id", authenticator, permissionCheck, getOneCommonQA);

//UPDATE a commonQA
router.put("/:id", updateCommonQA);
// router.put("/:id", authenticator, permissionCheck, updateCommonQA);

// DELETE a commonQA
router.delete("/:id", deleteCommonQA);
// router.delete("/:id", authenticator, permissionCheck, deleteCommonQA);

export default router;
