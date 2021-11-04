import mongoose from "mongoose";
import Category from "./category.js";
const { Schema } = mongoose;

const postSchema = new Schema({
  itemName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    required: true,
  },
  itemStatus: {
    type: String,
    enum: ["全新", "二手"],
    required: true,
  },
  description: String,
  tradingOptions: {
    convenientStore: {
      storeCode: { type: Number, match: /^\d{5, 6}$/ }, //6碼=7-11、全家, 5碼=全家、萊爾富、OK
      storeName: { type: String },
      fee: {
        type: Number,
        default: 60,
      },
    },
    faceToFace: {
      region: {
        type: String,
        enum: [
          "基隆市",
          "臺北市",
          "新北市",
          "桃園市",
          "宜蘭縣",
          "新竹市",
          "新竹縣",
          "苗栗縣",
          "台中市",
          "彰化縣",
          "南投縣",
          "花蓮縣",
          "雲林縣",
          "嘉義縣",
          "臺南市",
          "高雄市",
          "台東縣",
          "屏東縣",
          "澎湖縣",
          "金門縣",
          "連江縣",
        ],
      },
      district: {
        type: String,
      },
      fee: {
        type: Number,
        default: 0,
      },
    },
    // logisticsExpress: {company:{type: String, enum:["黑貓宅急便", "新竹物流", "台灣便利通"] }, fee: {type: Number, default: 100}, }
  },

  payer: {
    type: String,
    //enum: ["刊登者", "索取者", "贈與者"]
    default: "索取者",
    //required: true,
  },
  isGoal: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  //imgUrls: String,
  // ownerId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  //   index: true,
  //   required: true,
  // },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    index: true,
    required: true,
  },
});

postSchema.set("timestamps", true);

export default mongoose.model("Post", postSchema);
