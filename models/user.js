import mongoose from "mongoose";
const { Schema } = mongoose;

// define user schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
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
  }, //TODO: check setup fields
});

export default mongoose.model("User", userSchema);
