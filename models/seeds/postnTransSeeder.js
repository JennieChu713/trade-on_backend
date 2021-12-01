import db from "../../config/mongoose.js";
import Post from "../post.js";
import Category from "../category.js";
import Transaction from "../transaction.js";
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

// generate seed data
db.once("open", async () => {
  console.log("generating seed data for posts with category and transaction");

  //clearout collection past data if exist
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
  const transExist = await Transaction.find();
  if (transExist.length) {
    await Transaction.deleteMany({});
    console.log("clearout origin document data of transaction.");
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
          process.exit();
        }

        // generate 30 dummy data of Posts
        Array.from({ length: 30 }, async (_, i) => {
          const getCategory = await Category.findOne({
            categoryName: categories[pickRandom(categories.length)],
          });
          const category = getCategory._id;

          const itemStatus = pickRandom(15) % 2 === 0 ? "全新" : "二手";
          const { _id } = findUser;
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
            owner: _id,
          });

          if (i === 29) {
            console.log("post seeder data complete.");
            const allPosts = await Post.find();
            const findDealer = await User.findOne({ email: "dealer@mail.com" });

            // generate 3 transaction dummy data
            Array.from({ length: 3 }, async (_, i) => {
              const post = allPosts[pickRandom(allPosts.length)];
              await Transaction.create({
                amount: pickRandom(post.quantity, "qnt"),
                post: post._id,
                dealMethod: {
                  [post.tradingOptions.convenientStore.storeCode
                    ? "convenientStore"
                    : "faceToFace"]: post.tradingOptions.convenientStore
                    .storeCode
                    ? post.tradingOptions.convenientStore
                    : post.tradingOptions.faceToFace,
                },
                dealer: findDealer._id,
                owner: _id,
              });

              if ((await Transaction.countDocuments()) === 3) {
                console.log("transaction seeder data complete.");
                process.exit();
              }
            });
          }
        });
      }
    } catch (err) {
      console.log("generate category seed data failed");
      console.error(err);
    }
  });
});
