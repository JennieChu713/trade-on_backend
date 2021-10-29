import mongoose from "mongoose";
const { Schema } = mongoose;

const msgSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  relatedMsgId: {
    type: Schema.Types.ObjectId,
    ref: "Message",
  },
  messageType: {
    type: String,
    enum: ["question", "apply"],
    required: true,
  },
  // postId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Post",
  // },
  // userId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  //   index: true,
  //   required: true,
  // },
});

msgSchema.set("timestamps", true);

export default mongoose.model("Message", msgSchema);
