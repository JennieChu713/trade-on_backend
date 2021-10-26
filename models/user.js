import mongoose from "mongoose";
const { Schema } = mongoose;

// define user schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  introduction: String,
  provider: {
    type: String,
    //default: "local",
    // enum: ["facebook", "line"],
  },
  avatarUrl: String,
  account: {
    accountName: String,
    bankCode: Number,
    bankName: String,
    accountNum: Number,
  },
  isAllowPost: {
    type: Boolean,
    default: true,
  },
  isAllowMessage: {
    type: Boolean,
    default: true,
  },
  accountAuthority: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

export default mongoose.model("User", userSchema);
