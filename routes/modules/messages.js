import express from "express";
import Message from "../../models/message.js";
import mongoose from "mongoose";
import Post from "../../models/post.js";

const router = express.Router();

// READ all messages of related post
router.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const allMsgs = await Message.find({ post: id })
      .lean()
      .select("-__v -createdAt -updatedAt");
    res.status(200).json({ message: "success", allMsgs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
// READ all messages with related transaction
router.get("/deal/:id", async (rea, res) => {
  // TODO: user authentication
  const { id } = req.params;
  try {
    const allMsgs = await Message.find(); //await Message.find({deal: ObjectId(id)})
    res.status(200).json({ message: "success", allMsgs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
*/

// READ one message (for edit rendering value)
router.get("/:id", async (req, res) => {
  //TODO: user authentication
  const { id } = req.params;
  try {
    const msg = await Message.findById(id)
      .lean()
      .select("-__v -createdAt -updatedAt");
    res.status(200).json({ message: "success", msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a message (post and transaction)
router.post("/", async (req, res) => {
  // TODO: user authentication
  const { content, messageType, relatedId, userId } = req.body; // relatedId is post or transaction
  const { _id } = await Post.findById(relatedId); //|| await Transaction.findById(relatedId);
  try {
    let newMessage;
    if (messageType !== "transaction") {
      newMessage = await Message.create({
        content,
        messageType,
        post: _id,
        owner: userId,
      });
    } else {
      newMessage = await Message.create({
        content,
        messageType,
        deal: _id,
        owner: userId,
      });
    }
    res.status(200).json({ message: "success", newMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//CREATE a reply (post and transaction)
router.post("/:id", async (req, res) => {
  // TODO: user authentication
  const { id } = req.params; // message id
  const { content, messageType, relatedId, userId } = req.body; // related id could be the post or transaction
  const { ObjectId } = mongoose.Types;
  try {
    // check if the message is the related subject
    const checkMsg = await Message.findById(id);
    const related = checkMsg.post || checkMsg.deal;
    if (related !== relatedId) {
      return res.status(200).json({ message: "No permission." });
    }

    const newReply = await Message.create({
      content,
      messageType,
      relatedMsg: id,
      owner: userId,
    });
    res.status(200).json({ message: "success", newReply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//UPDATE message / reply
router.put("/:id", async (req, res) => {
  //TODO: user authentication
  const { id } = req.params;
  const { content, userId } = req.body;
  try {
    const editMsg = await Message.findByIdAndUpdate(
      id,
      { content, owner: userId },
      {
        runValidators: true,
        new: true,
      }
    );
    res.status(200).json({ message: "success", editMsg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//DELETE message with related replies / single reply
router.delete("/:id", async (req, res) => {
  // TODO: user authentication
  const { id } = req.params;
  const { content, userId } = req.body;
  const { ObjectId } = mongoose.Types;
  try {
    const findMsg = await Message.findById(id);
    if (!findMsg.relatedMsg) {
      const findRelatedMsgs = await Message.find({
        $or: [{ _id: id, owner: userId }, { relatedMsg: ObjectId(id) }],
      });
      if (findRelatedMsgs.length) {
        findRelatedMsgs.forEach(async (msg) => {
          await Message.deleteOne(msg);
        });
        return res.status(200).json({
          message: "delete all related messages successfully.",
        });
      }
    }
    await findMsg.delete();
    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
