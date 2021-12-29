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

// Posts with categories
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
    convenientStores: ["7-11"],
    faceToFace: {
      region: "新北市",
      district: "新莊區",
    },
  },

  {
    convenientStores: ["7-11", "全家"],
  },

  {
    faceToFace: {
      region: "南投縣",
      district: "埔里鎮",
    },
  },
  {
    convenientStores: ["全家"],
    faceToFace: {
      region: "臺南市",
      district: "善化區",
    },
  },

  {
    convenientStores: ["全家"],
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

// messages with transactions
const startAMsgs = [
  { content: "想要J個酷東西", messageType: "apply" },
  {
    content: "我是這個牌子的大粉絲！請問可以給我嗎？\n我會非常珍惜地使用的！",
    messageType: "apply",
  },
  { content: "希望能夠得到這個，非常感謝:)", messageType: "apply" },
  { content: "真的非常需要這個，希望你願意送我> <", messageType: "apply" },
];

const startQMsgs = [
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
  { content: "已經送出，請你記得進入流程填資訊喔", messageType: "apply" },
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
      dataExist = await CommonQA.findOne();
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
              return res.status(404).json({
                message:
                  "generate post relation seeder data failed: no user exist, you need to have user data to proceed. (run 'node models/userSeeder.js')",
              });
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
              }
            });
          }
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });
      return res.status(200).json({
        message:
          "success; reset posts of 30 samples and categories of 7 samples.",
      });

    case "messages":
      const msgExist = await Message.findOne();
      if (msgExist) {
        await Message.deleteMany({});
        console.log("clearout origin document data of message");
      }

      const transExist = await Transaction.findOne();
      if (transExist) {
        await Transaction.deleteMany({});
        console.log("clearout origin document data of transaction.");
      }

      //check user and post data
      const checkUsers = await User.find({
        $or: [{ email: "dealer@mail.com" }, { email: "owner@mail.com" }],
      });
      const checkPosts = await Post.find();

      if (!checkUsers.length || !checkPosts.length) {
        console.log(
          "generate message seed data failed: post and user data required. run 'node model/userSeeder.js' then 'node model/catePostsSeeder.js'"
        );
        process.exit(1);
      }

      let owner, dealer;
      checkUsers.forEach((user) => {
        if (user.email === "dealer@mail.com") {
          dealer = user._id;
        } else {
          owner = user._id;
        }
      });

      //generating 3 dummy transaction data
      Array.from({ length: 12 }, async (_, i) => {
        const post = checkPosts[pickRandom(checkPosts.length)];
        const convenientStoresOptions = post.tradingOptions.convenientStores;
        const dealMethod =
          convenientStoresOptions && convenientStoresOptions.length
            ? {
                convenientStore:
                  convenientStoresOptions[
                    pickRandom(convenientStoresOptions.length)
                  ],
              }
            : { faceToFace: post.tradingOptions.faceToFace };
        const isFace = dealMethod.faceToFace ? true : false;

        try {
          const trans = await Transaction.create({
            amount: pickRandom(post.quantity, "qnt"),
            post: post._id,
            dealMethod,
            isFilled: isFace,
            isPaid: isFace,
            dealer,
            owner,
          });
          if (trans) {
            // settled transaction with related apply messages
            await Message.create({
              ...startAMsgs[pickRandom(startAMsgs.length)],
              applyDealMethod: dealMethod,
              post: post._id,
              author: dealer,
            });
          }

          // random transaction message data and reply
          if (pickRandom(4) % 2) {
            const msg = await Message.create({
              content: "寄送資料已經填寫好囉！再請你確認～",
              messageType: "transaction",
              deal: trans._id,
              author: dealer,
            });

            if (msg && pickRandom(4) % 2) {
              await Message.create({
                content: "好的，確認後我再回覆您！",
                messageType: "transaction",
                deal: trans._id,
                relatedMsg: msg._id,
                author: owner,
              });
            }
          }

          if (i === 11) {
            console.log("transaction seeder data complete.");

            // generating 11 dummy data for post messages
            Array.from({ length: 7 }, async (_, i) => {
              const {
                id,
                tradingOptions: { convenientStores, faceToFace },
              } = checkPosts[pickRandom(checkPosts.length)];

              const messageType = pickRandom(4) % 2 ? "question" : "apply";
              let dataStruct;
              switch (messageType) {
                case "question":
                  dataStruct = {
                    ...startQMsgs[pickRandom(startQMsgs.length)],
                    post: id,
                    author: dealer,
                  };
                  break;
                case "apply":
                  dataStruct = {
                    ...startAMsgs[pickRandom(startAMsgs.length)],
                    applyDealMethod: convenientStores.length
                      ? {
                          convenientStore:
                            convenientStores[
                              pickRandom(convenientStores.length)
                            ],
                        }
                      : { faceToFace },
                    post: id,
                    author: dealer,
                  };
                  break;
              }

              const newMsg = await Message.create({ ...dataStruct });
              if (newMsg) {
                const addReply = replyMsgs[pickRandom(replyMsgs.length)];
                if (addReply.messageType === newMsg.messageType) {
                  await Message.create({
                    ...addReply,
                    post: id,
                    relatedMsg: newMsg._id,
                    author: owner,
                  });
                }
              }

              if (i === 6) {
                console.log("complete seed data of message");
              }
            });
          }
        } catch (err) {
          console.error(err.message);
        }
      });
      return res.status(200).json({
        message:
          "success; reset messages of 14 samples with random reply and 3 transactions.",
      });
  }
};
