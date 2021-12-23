import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const { Schema } = mongoose;

const transactSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  dealMethod: Object,
  isFilled: {
    type: Boolean,
    default: false,
  },
  sendingInfo: {
    name: { type: String },
    cellPhone: { type: String, match: /^\d{4}[-]?\d{6}$/ },
    storeCode: { type: String, match: /^\d{5, 6}$/ },
    storeName: { type: String },
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  isCancelable: {
    type: Boolean,
    default: true,
  },
  isCanceled: {
    type: Boolean,
    default: false,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    index: true,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  dealer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
});

transactSchema.set("timestamps", true);

transactSchema.method("toJSON", function () {
  const { __v, _id, updatedAt, createdAt, ...object } = this.toObject();
  object.id = _id;
  const timeOptions = {
    timeZone: "Asia/Taipei",
    hour12: false,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
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

transactSchema.plugin(mongoosePaginate);

export default mongoose.model("Transaction", transactSchema);
