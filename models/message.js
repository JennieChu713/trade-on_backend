import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const { Schema } = mongoose;

const msgSchema = new Schema({
  content: {
    type: String,
  },
  applyDealMethod: Object,
  relatedMsg: {
    type: Schema.Types.ObjectId,
    ref: "Message",
  },
  messageType: {
    type: String,
    enum: ["question", "apply", "transaction"],
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  deal: {
    type: Schema.Types.ObjectId,
    ref: "Transaction",
  },
  owner: {
    // author?
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

msgSchema.set("timestamps", true);

msgSchema.method("toJSON", function () {
  const { __v, _id, updatedAt, createdAt, ...object } = this.toObject();
  const timeOptions = {
    timeZone: "Asia/Taipei",
    hour12: false,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  object.id = _id;
  if (createdAt) {
    object.createdAt = new Date(createdAt).toLocaleString("zh-TW", timeOptions);
  }
  if (updatedAt) {
    object.lastModified = new Date(updatedAt).toLocaleString(
      "zh-TW",
      timeOptions
    );
  }
  return object;
});

msgSchema.plugin(mongoosePaginate);

export default mongoose.model("Message", msgSchema);
