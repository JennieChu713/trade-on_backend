import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
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

//userSchema.method("toJSON", )
// save hashed password
userSchema.pre("save", async function (next) {
  //must use function declaration
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

userSchema.plugin(mongoosePaginate);

export default mongoose.model("User", userSchema);
