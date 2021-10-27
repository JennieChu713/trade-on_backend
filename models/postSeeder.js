import db from "../config/mongoose.js";
import Post from "./post.js";

//seeder data
const items = [
  "鋼筆",
  "素食炸醬麵",
  "可愛造型時鐘",
  "game boy 遊戲卡匣",
  "凱蒂貓玩偶",
  "童軍繩",
  "筆記本",
];
const tradings = [
  {
    convenientStore: {
      storeCode: 174833,
      storeName: "建中",
    },
    faceToFace: {
      region: "新北市",
      district: "新莊區",
    },
  },

  {
    convenientStore: {
      storeCode: 194217,
      storeName: "莊捷",
    },
  },

  {
    faceToFace: {
      region: "南投縣",
      district: "埔里鎮",
    },
  },
  {
    convenientStore: {
      storeCode: 115882,
      storeName: "全家善化興華店",
    },
    faceToFace: {
      region: "臺南市",
      district: "善化區",
    },
  },

  {
    convenientStore: {
      storeCode: 16719,
      storeName: "全家平鎮南東店",
    },
  },
  {
    faceToFace: {
      region: "基隆市",
      district: "安樂區",
    },
  },
];
function pickRandom(num, mode = "pick") {
  if (mode !== "pick") {
    return Math.floor(Math.random() * num) + 1;
  }
  return Math.floor(Math.random() * num);
}

// generate seed data
db.once("open", async () => {
  console.log("generating seed data for posts");

  //clearout posts collection data if exist
  const dataExist = await Post.find();
  if (dataExist.length) {
    await Post.deleteMany({});
    console.log("clearout origin document data.");
  }

  // generate 30 dummy data
  Array.from({ length: 30 }, async (_, i) => {
    try {
      const itemStatus = pickRandom(15) % 2 === 0 ? "全新" : "二手";
      await Post.create({
        itemName: items[pickRandom(items.length)],
        quantity: pickRandom(10, "qnt"),
        itemStatus,
        tradingOptions: tradings[pickRandom(tradings.length)],
      });
      if (i === 29) {
        console.log("seeder data complete.");
        process.exit();
      }
    } catch (err) {
      console.log("generate seed data failed");
      console.error(err);
    }
  });
});
