import CommonQA from "../models/commonQA.js";

export default class CommonQAsControllers {
  static async getAllCommonQAs(req, res, next) {
    const { sortBy } = req.query;
    let updatedAt = 1;
    switch (sortBy) {
      case "asc":
        updatedAt = 1;
        break;
      case "desc":
        updatedAt = -1;
        break;
    }
    try {
      const allQAs = await CommonQA.find().sort({ updatedAt });

      res.status(200).json({ message: "success", allQAs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getOneCommonQA(req, res, next) {
    const { id } = req.params;
    try {
      const qna = await CommonQA.findById(id);
      if (qna) {
        res.status(200).json({ message: "success", QnA: qna });
      } else {
        return res
          .status(404)
          .json({ error: "The question you are looking for does not exist." });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createCommonQA(req, res, next) {
    const { question, answer, imgUrls } = req.body;
    try {
      const newQA = { question, answer };
      const addQA = await CommonQA.create(newQA);
      res.status(200).json({ message: "success", new: addQA });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateCommonQA(req, res, next) {
    const { id } = req.params;
    const { question, answer } = req.body;
    try {
      const editQA = await CommonQA.findByIdAndUpdate(
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
    const { id } = req.params;
    try {
      await CommonQA.findByIdAndDelete(id);
      res.status(200).json({ message: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
