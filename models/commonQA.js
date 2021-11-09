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
  if (createdAt) {
    object.createdAt = new Date(createdAt).toLocaleString();
  }
  if (updatedAt) {
    object.lastModified = new Date(updatedAt).toLocaleString();
  }
  return object;
});

commonQASchema.plugin(mongoosePaginate);

// export model
export default mongoose.model("Common_QA", commonQASchema);
