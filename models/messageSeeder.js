import db from "../config/mongoose.js";
import message from "./message.js";
import Message from "./message.js";

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

  // generate 7 dummy data
  Array.from({ length: 7 }, async (_, i) => {
    try {
      const message = await Message.create(
        postMsgs[pickRandom(postMsgs.length)]
      );

      if (message) {
        const { _id, messageType } = message;
        const addReply = replyMsgs[pickRandom(replyMsgs.length)];
        if (addReply.messageType === messageType) {
          await Message.create({ ...addReply, relatedMsg: _id });
        }
      }
      if (i === 6) {
        console.log("complete seeder data.");
        process.exit();
      }
    } catch (err) {
      console.log("generate seed data failed");
      console.error(err);
    }
  });
});
