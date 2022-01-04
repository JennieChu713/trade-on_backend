import db from "../../config/mongoose.js";
import Post from "../post.js";
import Category from "../category.js";
import User from "../user.js";

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
    selectedMethods: ["7-11", "面交"],
    faceToFace: {
      region: "新北市",
      district: "新莊區",
    },
  },

  {
    selectedMethods: ["7-11", "全家"],
  },

  {
    selectedMethods: ["面交"],
    faceToFace: {
      region: "南投縣",
      district: "埔里鎮",
    },
  },
  {
    selectedMethods: ["全家", "面交"],
    faceToFace: {
      region: "臺南市",
      district: "善化區",
    },
  },

  {
    selectedMethods: ["全家"],
  },
  {
    selectedMethods: ["面交"],
    faceToFace: {
      region: "基隆市",
      district: "安樂區",
    },
  },
];

const descripts = [
  "一直維持很乾淨的狀態，如果願意的話請收下。",
  "雖然舊但堪用",
  '事情是這樣的，因為家裡東西實在是太多了> <"⋯⋯\n所以就決定來個大清倉，但就像照片看到的，其實都跟全新一樣，就給有緣分的人，希望這些物品還能被好好愛惜下去。\n需要的人請按申請，感謝！',
  "買來之後就完全沒開過，所以給需要的人。",
  "遺忘很久的東西，不過狀態還不錯，所以就送給需要的人。\n所索取請留言聯絡。",
];

function pickRandom(num, mode = "pick") {
  if (mode === "qnt") {
    return Math.floor(Math.random() * num) + 1;
  }
  return Math.floor(Math.random() * num);
}

// generate data
db.once("open", async () => {
  console.log("generating seed data of category and post");

  //clearout collection past data if exist
  const categoryDataExist = await Category.findOne();
  if (categoryDataExist) {
    await Category.deleteMany({});
    console.log("clearout origin document data of categories.");
  }
  const postDataExist = await Post.findOne();
  if (postDataExist) {
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

        // check users data
        const findUser = await User.findOne({ email: "owner@mail.com" });
        if (!findUser) {
          console.log(
            "generate post relation seeder data failed: no user exist, you need to have user data to proceed. (run 'node models/userSeeder.js')"
          );
          process.exit(1);
        }

        // generate 30 dummy data of Posts
        Array.from({ length: 30 }, async (_, i) => {
          const getCategory = await Category.findOne({
            categoryName: categories[pickRandom(categories.length)],
          });
          const category = getCategory._id;

          const itemStatus = pickRandom(15) % 2 === 0 ? "全新" : "二手";
          const { id } = findUser;
          const imgUrls = [
            "https://images.unsplash.com/photo-1558276561-95e31d860c4b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
          ];
          const newPost = await Post.create({
            itemName: items[pickRandom(items.length)],
            quantity: pickRandom(10, "qnt"),
            itemStatus,
            imgUrls,
            description: descripts[pickRandom(descripts.length)],
            tradingOptions: tradings[pickRandom(tradings.length)],
            category,
            author: id,
          });

          if (i === 29) {
            console.log("post seeder data complete.");
            process.exit(1);
          }
        });
      }
    } catch (err) {
      console.log("generate category seed data failed");
      console.error(err);
    }
  });
});
