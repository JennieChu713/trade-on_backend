import mongoose from "mongoose";
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

// export model
export default mongoose.model("Common_QA", commonQASchema);
