import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import bcrypt from "bcrypt";
const { Schema } = mongoose;

// define user schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    unique: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  introduction: String,
  provider: {
    type: String,
    default: "local",
    select: false,
    enum: ["local", "facebook"],
  },
  avatarUrl: String,
  account: {
    accountName: String,
    bankCode: Number,
    bankName: String,
    accountNum: Number,
    select: false,
  },
  isAllowPost: {
    type: Boolean,
    default: true,
    select: false,
  },
  isAllowMessage: {
    type: Boolean,
    default: true,
    select: false,
  },
  accountAuthority: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
    select: false,
  },
  preferDealMethods: {
    convenientStores: [{ type: String, enum: ["7-11", "全家"] }],
    faceToFace: {
      region: {
        type: String,
        enum: allRegions,
      },
      district: {
        type: String,
        enum: allDistricts,
      },
    },
  },
});

userSchema.set("timestamps", true);

userSchema.plugin(mongoosePaginate);

userSchema.method("toJSON", function () {
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

// save hashed password
userSchema.pre("save", async function (next) {
  //must use function declaration
  if (!this.preferDealMethods.convenientStores.length) {
    this.preferDealMethods.convenientStores = undefined;
  }

  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// verified password function
userSchema.methods.matchPasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
