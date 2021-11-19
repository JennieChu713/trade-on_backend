import db from "../../config/mongoose.js";
import Message from "../message.js";
import Post from "../post.js";
import Transaction from "../transaction.js";
import User from "../user.js";

//seeder data
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

function pickRandom(num) {
  return Math.floor(Math.random() * num);
}

// generate data
db.once("open", async () => {
  // clearout data if collection exist
  const dataExist = await Message.find();
  if (dataExist) {
    await Message.deleteMany({});
    console.log("clearout existing data");
  }

  //check user and post data
  const checkUser = await User.find({
    $or: [{ email: "dealer@mail.com" }, { email: "owner@mail.com" }],
  });

  const checkPost = await Post.findOne();
  const checkTrans = await Transaction.findOne();
  if (!checkUser || !checkPost || !checkTrans) {
    console.log(
      "generate message seed data failed: transaction, post and user data required. run 'node model/userSeeder.js' then 'node model/messageSeeder.js'"
    );
    process.exit();
  }

  let owner, dealer;
  checkUser.forEach((user) => {
    if (user.nickname === "dealer") {
      dealer = user._id;
    } else {
      owner = user._id;
    }
  });

  console.log("generating message seed data.");

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
        const transMsg = await Message.create({
          content: "寄送資料已經填寫好囉！再請你確認～",
          messageType: "transaction",
          deal: checkTrans._id,
          owner: dealer,
        });
        if (transMsg) {
          const replyTrans = await Message.create({
            content: "好的，確認後我再回覆您！",
            messageType: "transaction",
            deal: checkTrans._id,
            relatedMsg: transMsg._id,
            owner,
          });
          if (replyTrans) {
            console.log("complete message seeder data.");
            process.exit();
          }
        }
      }
    } catch (err) {
      console.log("generate message seed data failed");
      console.error(err);
    }
  });
});
