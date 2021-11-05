import mongoose from "mongoose";
const { Schema } = mongoose;

const msgSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  relatedMsg: {
    type: Schema.Types.ObjectId,
    ref: "Message",
  },
  messageType: {
    type: String,
    enum: ["question", "apply", "transaction"],
    required: true,
  },
  // post: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Post",
  // },
  // deal: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Transaction",
  // },
  // owner: {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  //   index: true,
  //   required: true,
  // },
});

msgSchema.set("timestamps", true);

export default mongoose.model("Message", msgSchema);
