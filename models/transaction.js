import mongoose from "mongoose";
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
    cellPhone: { type: Number, match: /^\d{4}[-]*\d{6}$/ },
    storeCode: { type: Number, match: /^\d{5, 6}$/ },
    storeName: { type: String },
  },
  isPayed: {
    type: Boolean,
    default: false,
  },
  isSent: {
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

export default mongoose.model("Transaction", transactSchema);
