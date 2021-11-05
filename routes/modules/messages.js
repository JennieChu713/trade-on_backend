import express from "express";
import Message from "../../models/message.js";
import mongoose from "mongoose";

const router = express.Router();

// READ all messages of related post
router.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const allMsgs = await Message.find(); //await Message.find({post: ObjectId(id)})
    res.status(200).json({ message: "success", allMsgs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all messages with related transaction
router.get("/deal/:id", async (rea, res) => {
  const { id } = req.params;
  try {
    const allMsgs = await Message.find(); //await Message.find({deal: ObjectId(id)})
    res.status(200).json({ message: "success", allMsgs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a message (post and transaction)
router.post("/", async (req, res) => {
  // TODO: user authentication
  const { content, messageType, relatedId } = req.body;
  try {
    const newMessage = await Message.create({ content, messageType });
    if (newMessage) {
      res.status(200).json(newMessage);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//CREATE a reply (post and transaction)
router.post("/:id", async (req, res) => {
  // TODO: user authentication
  const { id } = req.params;
  const { content, messageType, relatedId } = req.body;
  try {
    // const checkMsg = await Message.find({ });
    //if ()
    const newReply = await Message.create({
      content,
      messageType,
      relatedMsg: id,
    });
    if (newReply) {
      res.status(200).json(newReply);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//UPDATE message / reply
router.put("/:id", async (req, res) => {
  //TODO: user authentication
  const { id } = req.params;
  const { content } = req.body;
  try {
    const editMsg = await Message.findByIdAndUpdate(id, content, {
      runValidators: true,
      new: true,
    });
    if (editMsg) {
      res.status(200).json(editMsg);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//DELETE message/ reply
router.delete("/:id", async (req, res) => {
  // TODO: user authentication
  const { id } = req.params;
  const { content } = req.body;
  const { ObjectId } = mongoose.Types;
  try {
    const findRelatedMsgs = await Message.find({
      $or: [{ _id: id }, { relatedMsg: ObjectId(id) }],
    });
    if (findRelatedMsgs.length) {
      await Message.deleteMany(findRelatedMsgs);
    }
  } catch (err) {}
});

export default router;
