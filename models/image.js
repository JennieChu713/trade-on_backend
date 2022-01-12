import mongoose from "mongoose";
const { Schema } = mongoose;

const ImageSchema = new Schema({
  _id: false,
  imgUrl: String,
  deleteHash: { type: String, select: false },
});

export default ImageSchema;
