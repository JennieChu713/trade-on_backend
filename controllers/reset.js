import CommonQA from "../models/commonQA.js";
import User from "../models/user.js";
import Message from "../models/message.js";
import Post from "../models/post.js";
import Category from "../models/category.js";
import Transaction from "../models/transaction.js";

// commonQnAs
const qas = [
  {
    question: "請問要怎麼樣才能使用 Tradeon 的服務呢？",
    answer:
      "只要註冊成為 Tradeon 的會員，或透過本網站提供的第三方登入（facebook、line等）即可",
  },
  {
    question: "運費要怎麼付？",
    answer:
      "我們目前提供面交或店到店到貨的方式；後者可以透過貨到付款、先付款再取貨，以及ATM轉帳的方式交付運費。",
  },
  {
    question: "要如何跟對方索取刊登的物品？",
    answer:
      "如果您對物品有其他疑問時，可以點選「留言」，若想要直接索取，則點選「索取禮物」。當對方確定要將物品贈送給您時，您就會收到對方回應的訊息。",
  },
  {
    question: "要如何跟對方索取刊登的物品？",
    answer:
      "如果您對物品有其他疑問時，可以點選「留言」，若想要直接索取，則點選「索取禮物」。當對方確定要將物品贈送給您時，您就會收到對方回應的訊息。",
  },
  {
    question: "要如何贈送物品？",
    answer:
      "您要先新增刊登，並隨欄位填寫物品的狀態與數量，送出後便可以開始進行贈送了！",
  },
];

// Posts with categories and transactions
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

// messages
const startMsgs = [
  { content: "想要J個酷東西", messageType: "apply" },
  {
    content: "我是這個牌子的大粉絲！請問可以給我嗎？\n我會非常珍惜地使用的！",
    messageType: "apply",
  },
  { content: "希望能夠得到這個，非常感謝:)", messageType: "apply" },
  { content: "真的非常需要這個，希望你願意送我> <", messageType: "apply" },
  { content: "請問這上面有期限嗎？", messageType: "question" },
  { content: "請問這個還有嗎？", messageType: "question" },
  {
    content: "你好，請問有沒有機會看一下這個東西背面的樣子？",
    messageType: "question",
  },
  { content: "請問這有其他顏色嗎？", messageType: "question" },
];

const replyMsgs = [
  { content: "OK沒問題喔！", messageType: "apply" },
  { content: "已經送出，請你記得按一下確定來進入流程喔", messageType: "apply" },
  { content: "沒有耶，不好意思", messageType: "question" },
  { content: "好，先等一下喔", messageType: "question" },
];

// random functions
function pickRandom(num, mode = "pick") {
  if (mode === "qnt") {
    return Math.floor(Math.random() * num) + 1;
  }
  return Math.floor(Math.random() * num);
}

export const resetting = async (req, res, next) => {
  const { type } = req.query;
  let dataExist;
  switch (type) {
    case "commonqnas":
      dataExist = await CommonQA.find();
      if (dataExist) {
        await CommonQA.deleteMany({});
      }
      Array.from({ length: 20 }, async (_, i) => {
        try {
          await CommonQA.create(qas[pickRandom(qas.length)]);
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });
      return res
        .status(200)
        .json({ message: "success; reset commonQAs as 20 samples." });

    case "posts":
      dataExist = await Post.find();
      const categoryDataExist = await Category.find();
      const transExist = await Transaction.find();

      if (dataExist) {
        await Post.deleteMany({});
      }
      if (categoryDataExist.length) {
        await Category.deleteMany({});
      }
      if (transExist.length) {
        await Transaction.deleteMany({});
      }
      categories.forEach(async (category, i) => {
        try {
          await Category.create({
            categoryName: category,
          });

          if (i === categories.length - 1) {
            // check users data
            const findUser = await User.findOne({ email: "owner@mail.com" });
            if (!findUser) {
              return res
                .status(500)
                .json({ error: "You need to generate users data first." });
            }

            // generate 30 dummy data of Posts
            Array.from({ length: 30 }, async (_, i) => {
              const getCategory = await Category.findOne({
                categoryName: categories[pickRandom(categories.length)],
              });
              const category = getCategory._id;

              const itemStatus = pickRandom(15) % 2 === 0 ? "全新" : "二手";
              const { _id } = findUser;
              const newPost = await Post.create({
                itemName: items[pickRandom(items.length)],
                quantity: pickRandom(10, "qnt"),
                itemStatus,
                tradingOptions: tradings[pickRandom(tradings.length)],
                category,
                owner: _id,
              });

              if (i === 29) {
                const allPosts = await Post.find();
                const findDealer = await User.findOne({
                  email: "dealer@mail.com",
                });
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
                });
              }
            });
          }
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });
      return res.status(200).json({
        message:
          "success; reset posts of 30 samples, categories of 7 samples, and transactions of 3 samples.",
      });

    case "messages":
      dataExist = await Message.find();
      if (dataExist) {
        await Message.deleteMany({});
      }

      //check user and post data
      const checkUser = await User.find({
        $or: [{ email: "dealer@mail.com" }, { email: "owner@mail.com" }],
      });

      const checkPost = await Post.findOne();
      const checkTrans = await Transaction.findOne();
      if (!checkUser || !checkPost || !checkTrans) {
        return res.status(401).json({ error: "must generate post first" });
      }

      let owner, dealer;
      checkUser.forEach((user) => {
        if (user.nickname === "dealer") {
          dealer = user._id;
        } else {
          owner = user._id;
        }
      });

      let created = false;
      // generate 7 dummy data (only post messages)
      Array.from({ length: 7 }, async (_, i) => {
        try {
          let message;
          message = await Message.create({
            ...startMsgs[pickRandom(startMsgs.length)],
            post: checkPost._id,
            owner: dealer,
          });
          // random generate reply message
          if (message) {
            const { _id, messageType } = message;
            const addReply = replyMsgs[pickRandom(replyMsgs.length)];
            if (addReply.messageType === messageType) {
              await Message.create({
                ...addReply,
                post: checkPost._id,
                relatedMsg: _id,
                owner,
              });
            }
          }

          if (i === 6) {
            await Message.create({
              content: "寄送資料已經填寫好囉！再請你確認～",
              messageType: "transaction",
              deal: checkTrans._id,
              owner: dealer,
            });
            if (transMsg) {
              await Message.create({
                content: "好的，確認後我再回覆您！",
                messageType: "transaction",
                deal: checkTrans._id,
                relatedMsg: transMsg._id,
                owner,
              });
            }
          }
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });
      return res.status(200).json({
        message: "success; reset messages of 6 samples with random reply.",
      });
  }
};
