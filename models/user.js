import mongoose from "mongoose";
const { Schema } = mongoose;

// define user schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    unique: true,
  },
  name: {
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
    default: "local",
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

userSchema.set("timestamps", true);

userSchema.method("toJSON", function () {
  const { __v, _id, updatedAt, createdAt, ...object } = this.toObject();
  object.id = _id;
  if (createdAt) {
    object.createdAt = new Date(createdAt).toLocaleString();
  }
  if (updatedAt) {
    object.lastModified = new Date(updatedAt).toLocaleString();
  }
  return object;
});

export default mongoose.model("User", userSchema);
