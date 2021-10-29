import express from "express";
import Message from "../../models/message.js";

const router = express.Router();

// READ all messages
router.get("/", async (req, res) => {
  try {
    const allMsgs = await Message.find();
    if (allMsgs) {
      res.status(200).json(allMsgs);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ a message with related reply
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const starterMsg = await Message.findById(id);
    const relatedMsgs = await Message.find({ relatedMsgId: id });
    if (starterMsg && relatedMsgs) {
      const data = {
        Message: starterMsg,
        reply: relatedMsgs,
      };
      res.status(200).json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a message
router.post("/", async (req, res) => {
  // TODO: user authentication
  const { content, messageType } = req.body;
  try {
    const newMessage = await Message.create({ content, messageType });
    if (newMessage) {
      res.status(200).json(newMessage);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//CREATE a reply
router.post("/:id", async (req, res) => {
  // TODO: user authentication
  const { id } = req.params;
  const { content, messageType } = req.body;
  try {
    const newReply = await Message.create({
      content,
      messageType,
      relatedMsgId: id,
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
  const { id } = req.params;
  const { content } = req.body;
  //CURSOR deletion?
});

export default router;
