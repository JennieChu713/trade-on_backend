import mongoose from "mongoose";
const { Schema } = mongoose;

// setup schema
const categorySchema = new Schema({
  categoryName: {
    type: String,
    required: true,
    // unique: true,
  },
});

// generate createdAt and updatedAt fields automatically
categorySchema.set("timestamps", true);

// export model
export default mongoose.model("Category", categorySchema);
