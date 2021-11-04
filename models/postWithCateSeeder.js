import db from "../config/mongoose.js";
import Post from "./post.js";
import Category from "./category.js";

// seeder data
const categories = [
  "生活雜貨",
  "家居裝飾",
  "3C產品",
  "文具用品",
  "書籍",
  "材料工具",
  "幼童用品",
];

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
  console.log("generating seed data for posts with category");

  //clearout posts collection data if exist
  const categoryDataExist = await Category.find();
  if (categoryDataExist.length) {
    await Category.deleteMany({});
    console.log("clearout origin document data of categories.");
  }
  const postDataExist = await Post.find();
  if (postDataExist.length) {
    await Post.deleteMany({});
    console.log("clearout origin document data of posts.");
  }
  // generate dummy data of Categories
  categories.forEach(async (category, i) => {
    try {
      await Category.create({
        categoryName: category,
      });

      if (i === categories.length - 1) {
        console.log("complete seed data of category.");
        // generate 30 dummy data of Posts
        Array.from({ length: 30 }, async (_, i) => {
          try {
            const getCategory = await Category.findOne({
              categoryName: categories[pickRandom(categories.length)],
            });
            const categoryId = getCategory._id;

            const itemStatus = pickRandom(15) % 2 === 0 ? "全新" : "二手";
            await Post.create({
              itemName: items[pickRandom(items.length)],
              quantity: pickRandom(10, "qnt"),
              itemStatus,
              tradingOptions: tradings[pickRandom(tradings.length)],
              categoryId,
            });
            if (i === 29) {
              console.log("post seeder data complete.");
              process.exit();
            }
          } catch (err) {
            console.log("generate seed data failed");
            console.error(err);
          }
        });
      }
    } catch (err) {
      console.log("generate category seed data failed");
      console.error(err);
    }
  });
});
