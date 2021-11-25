import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const { Schema } = mongoose;

// setup schema
const commonQASchema = new Schema({
  question: {
    type: String,
    required: true,
    // unique: true,
  },
  answer: {
    type: String,
    required: true,
    // unique: true,
  },
  // imgUrls: [String],
});

// generate createdAt and updatedAt fields automatically
commonQASchema.set("timestamps", true);

commonQASchema.method("toJSON", function () {
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

commonQASchema.plugin(mongoosePaginate);

// export model
export default mongoose.model("Common_QA", commonQASchema);
