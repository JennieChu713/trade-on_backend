import db from "../../config/mongoose.js";
import Message from "../message.js";
import Post from "../post.js";
import Transaction from "../transaction.js";
import User from "../user.js";

///seeder data
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

function pickRandom(num, mode = "pick") {
  if (mode === "qnt") {
    return Math.floor(Math.random() * num) + 1;
  }
  return Math.floor(Math.random() * num);
}

// generate data
db.once("open", async () => {
  console.log("generate seed data of message and transaction");

  //clearout data if exist
  const msgExist = await Message.find();
  if (msgExist.length) {
    await Message.deleteMany({});
    console.log("clearout origin document data of message");
  }

  const transExist = await Transaction.find();
  if (transExist.length) {
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
    if (user.nickname === "dealer") {
      dealer = user._id;
    } else {
      owner = user._id;
    }
  });

  //generating 3 dummy transaction data
  Array.from({ length: 3 }, async (_, i) => {
    const post = checkPosts[pickRandom(checkPosts.length)];
    const convenientStoresOptions = post.tradingOptions.convenientStores;
    const dealMethod =
      convenientStoresOptions && convenientStoresOptions.length
        ? convenientStoresOptions[pickRandom(convenientStoresOptions.length)]
        : post.tradingOptions.faceToFace;

    try {
      const trans = await Transaction.create({
        amount: pickRandom(post.quantity, "qnt"),
        post: post._id,
        dealMethod,
        dealer,
        owner,
      });

      await Message.create({
        ...startAMsgs[pickRandom(startAMsgs.length)],
        applyDealMethod: dealMethod,
        post: post._id,
        owner: dealer,
      });

      // random transaction message data and reply
      if (pickRandom(4) % 2) {
        const msg = await Message.create({
          content: "寄送資料已經填寫好囉！再請你確認～",
          messageType: "transaction",
          deal: trans._id,
          owner: dealer,
        });

        if (msg && pickRandom(4) % 2) {
          await Message.create({
            content: "好的，確認後我再回覆您！",
            messageType: "transaction",
            deal: trans._id,
            relatedMsg: msg._id,
            owner,
          });
        }
      }

      if (i === 2) {
        console.log("transaction seeder data complete.");

        // generating 11 dummy data for post messages
        Array.from({ length: 11 }, async (_, i) => {
          const {
            _id,
            tradingOptions: { convenientStores, faceToFace },
          } = checkPosts[pickRandom(checkPosts.length)];

          const messageType = pickRandom(4) % 2 ? "question" : "apply";

          let dataStruct;
          switch (messageType) {
            case "question":
              dataStruct = {
                ...startQMsgs[pickRandom(startQMsgs.length)],
                post: _id,
                owner: dealer,
              };
              break;
            case "apply":
              dataStruct = {
                ...startAMsgs[pickRandom(startAMsgs.length)],
                applyDealMethod: convenientStores
                  ? convenientStores[pickRandom(convenientStores.length)]
                  : faceToFace,
                post: _id,
                owner: dealer,
              };
              break;
          }

          const newMsg = await Message.create({ ...dataStruct });
          if (newMsg) {
            const addReply = replyMsgs[pickRandom(replyMsgs.length)];
            if (addReply.messageType === newMsg.messageType) {
              await Message.create({
                ...addReply,
                post: _id,
                relatedMsg: newMsg._id,
                owner,
              });
            }
          }

          if (i === 10) {
            console.log("complete seed data of message");
            process.exit(1);
          }
        });
      }
    } catch (err) {
      console.error(err.message);
    }
  });
});
