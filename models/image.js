import mongoose from "mongoose";
const { Schema } = mongoose;

const ImageSchema = new Schema({
  _id: false,
  imgUrl: String,
  deleteHash: { type: String, select: false },
  default: function() {
    if (this.itemName) {
      return "https://i.imgur.com/NGhlZr4.jpg";
    }
    if (this.email) {
      return "https://i.imgur.com/E3aSqYi.png";
    }
  }
});

export default ImageSchema;
