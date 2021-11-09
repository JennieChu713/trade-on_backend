import CommonQA from "../models/commonQA.js";

export default class commonQAsController {
  static async getAllCommonQAs(req, res, next) {
    try {
      const allQAs = await commonQA
        .find()
        .lean()
        .select("-__v -createdAt -updatedAt");
      res.status(200).json({ message: "success", allQAs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getOneCommonQA(req, res, next) {
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
  }

  static async createCommonQA(req, res, next) {
    // TODO: user authentication(admin)
    const { question, answer, imgUrls } = req.body;
    try {
      const newQA = { question, answer };
      const addQA = await commonQA.create(newQA);
      res.status(200).json({ message: "success", new: addQA });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateCommonQA(req, res, next) {
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
  }

  static async deleteCommonQA(req, res, next) {
    // TODO: user authentication(admin)
    const { id } = req.params;
    try {
      await commonQA.findByIdAndDelete(id);
      res.status(200).json({ message: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
