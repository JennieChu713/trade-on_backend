import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const { Schema } = mongoose;

// setup schema
const categorySchema = new Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
  },
});

// generate createdAt and updatedAt fields automatically
categorySchema.set("timestamps", true);

// change presenting data format for front-end fetching
categorySchema.method("toJSON", function () {
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

//use paginate plugin
categorySchema.plugin(mongoosePaginate);

// export model
export default mongoose.model("Category", categorySchema);
