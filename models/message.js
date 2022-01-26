import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const { Schema } = mongoose;

const msgSchema = new Schema({
  content: {
    type: String,
    required: function () {
      if (this.messageType !== "apply" || this.relatedMsg) {
        return true;
      } else {
        return false;
      }
    },
  },
  applyDealMethod: Object,
  relatedMsg: {
    type: Schema.Types.ObjectId,
    ref: "Message",
  },
  messageType: {
    type: String,
    enum: ["question", "apply", "transaction"],
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  deal: {
    type: Schema.Types.ObjectId,
    ref: "Transaction",
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  presentDeal: {
    type: Schema.Types.ObjectId,
    ref: "Transaction",
    select: false,
  },
  isDealing: {
    type: Boolean,
    default: function () {
      if (this.messageType === "apply") {
        if (this.presentDeal) {
          return true;
        }
        return false;
      }
      return undefined;
    },
  },
});

msgSchema.set("timestamps", true);

msgSchema.pre("save", async function (next) {
  //must use function declaration
  if (!this.isModified("content")) {
    next();
  }

  if (!this.content && this.messageType === "apply" && !this.relatedMsg) {
    this.content = undefined;
  }

  this.presentDeal ? (this.isDealing = true) : (this.isDealing = false);
  next();
});

msgSchema.method("toJSON", function () {
  const { __v, _id, updatedAt, createdAt, ...object } = this.toObject();
  const timeOptions = {
    timeZone: "Asia/Taipei",
    hour12: false,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  object.id = _id;
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

msgSchema.plugin(mongoosePaginate);

export default mongoose.model("Message", msgSchema);
