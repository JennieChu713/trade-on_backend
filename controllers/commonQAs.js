import CommonQA from "../models/commonQA.js";

import { errorResponse } from "../utils/errorMsgs.js";

export default class CommonQAsControllers {
  static async getAllCommonQAs(req, res) {
    const { sortBy } = req.query;
    let createdAt;
    switch (sortBy) {
      case "asc":
        createdAt = 1;
        break;
      case "desc":
        createdAt = -1;
        break;
      default:
        createdAt = 1;
        break;
    }
    try {
      const allQAs = await CommonQA.find().sort({ createdAt });

      if (!allQAs.length) {
        return res.status(200).json({
          message: "common QnA is empty in present. - 目前尚未建立常見問題資料",
        });
      }

      res.status(200).json({ message: "success", allQAs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getOneCommonQA(req, res) {
    const { id } = req.params;
    try {
      const qna = await CommonQA.findById(id);
      if (!qna) {
        errorResponse(res, 404);
        return;
      }

      res.status(200).json({ message: "success", QnA: qna });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createCommonQA(req, res) {
    const { question, answer } = req.body;
    try {
      const newQA = { question, answer };
      const addQA = await CommonQA.create(newQA);
      res.status(200).json({ message: "success", new: addQA });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateCommonQA(req, res) {
    const { id } = req.params;
    const { question, answer } = req.body;
    try {
      const editQA = await CommonQA.findByIdAndUpdate(
        id,
        { question, answer },
        { runValidators: true, new: true }
      );
      if (!editQA) {
        errorResponse(res, 404);
        return;
      }

      res.status(200).json({ message: "success", update: editQA });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteCommonQA(req, res) {
    const { id } = req.params;
    try {
      await CommonQA.findByIdAndDelete(id);
      res.status(200).json({ message: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
