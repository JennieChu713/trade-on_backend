import db from "../../config/mongoose.js";
import Message from "../message.js";
import Post from "../post.js";
import User from "../user.js";

//seeder data
const postMsgs = [
  { content: "想要J個酷東西", messageType: "apply" },
  { content: "平常都有在用，請問可以送給我嗎？謝謝！", messageType: "apply" },
  {
    content: "我是這個牌子的大粉絲！請問可以給我嗎？\n我會非常珍惜地使用的！",
    messageType: "apply",
  },
  { content: "希望能夠得到這個，非常感謝:)", messageType: "apply" },
  { content: "我非常需要的東西！希望你願意送我> <", messageType: "apply" },
  { content: "請問這上面有期限嗎？", messageType: "question" },
  { content: "請問這個還有嗎？", messageType: "question" },
  {
    content: "你好，請問有沒有機會看一下這個東西背面的樣子？",
    messageType: "question",
  },
  { content: "請問有什麼其他顏色嗎？", messageType: "question" },
  { content: "請問這上面有期限嗎？", messageType: "question" },
  { content: "請問這上面有期限嗎？", messageType: "question" },
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
  if (!checkUser || !checkPost) {
    console.log(
      "generate message seed data failed: post and user data required. run 'node model/userSeeder.js' then 'node model/messageSeeder.js'"
    );
    process.exit();
  }

  let owner, dealer;
  checkUser.forEach((user) => {
    if (user.name === "dealer") {
      dealer = user._id;
    } else {
      owner = user._id;
    }
  });

  console.log("generating message seed data.");

  // generate 7 dummy data (only post messages)
  Array.from({ length: 7 }, async (_, i) => {
    try {
      const message = await Message.create({
        ...postMsgs[pickRandom(postMsgs.length)],
        post: checkPost._id,
        owner: dealer,
      });

      // random generate reply message
      if (message) {
        const { _id, messageType } = message;
        const addReply = replyMsgs[pickRandom(replyMsgs.length)];
        if (addReply.messageType === messageType) {
          await Message.create({ ...addReply, relatedMsg: _id, owner });
        }
      }
      if (i === 6) {
        console.log("complete message seeder data.");
        process.exit();
      }
    } catch (err) {
      console.log("generate message seed data failed");
      console.error(err);
    }
  });
});