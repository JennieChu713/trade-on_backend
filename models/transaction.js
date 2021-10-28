import mongoose, { mongo } from "mongoose";
const { Schema } = mongoose;

const transactSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  isFilled: {
    type: Boolean,
    default: false,
  },
  sendingInfo: {
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    storeCode: { type: Number, required: true },
    storeName: { type: String, required: true },
  },
  isPayed: {
    type: Boolean,
    default: false,
  },
  accountInfo: {
    accountNum: { type: Number, required: true },
    bankCode: { type: Number, required: true },
    bankName: { type: String, required: true },
  },
  isSend: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  // itemId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Post",
  //   index: true,
  //   required: true,
  // },
  // ownerId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  //   index: true,
  //   required: true,
  // },
  // dealerId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  //   index: true,
  //   required: true,
  // }
});
transactSchema.set("timestamps", true);

export default mongoose.model("Transaction", transactSchema);
