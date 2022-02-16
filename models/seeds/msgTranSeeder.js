import db from "../../config/mongoose.js";
import SeedGenerators from "../../utils/seedsGenerator.js";

const { messageSeeds, transactionSeeds } = SeedGenerators;

///seeder data
const transMsgs = [
  { content: "寄送資料已經填寫好囉！再請你確認～", messageType: "transaction" },
  { content: "請問有收到資料嗎？", messageType: "transaction" },
  { content: "有些部分想和您商量一下⋯⋯", messageType: "transaction" },
];
const applyPostMsgs = [
  { content: "想要J個酷東西", messageType: "apply" },
  {
    content: "我是這個牌子的大粉絲！請問可以給我嗎？\n我會非常珍惜地使用的！",
    messageType: "apply",
  },
  { content: "希望能夠得到這個，非常感謝:)", messageType: "apply" },
  { content: "真的非常需要這個，希望你願意送我> <", messageType: "apply" },
];
const questionPostMsgs = [
  { content: "請問這上面有期限嗎？", messageType: "question" },
  { content: "請問這個還有嗎？", messageType: "question" },
  {
    content: "你好，請問有沒有機會看一下這個東西背面的樣子？",
    messageType: "question",
  },
  { content: "請問這有其他顏色嗎？", messageType: "question" },
];

const replyMsgs = [
  { content: "OK沒問題喔！" },
  { content: "可能要再看看O不OK" },
  { content: "沒有耶，不好意思" },
  { content: "好，先等一下喔" },
  { content: "好的，確認後我再回覆您！" },
];

// generate data
db.once("open", async () => {
  console.log("generate seed data of message and transaction");

  let msgProcess = await messageSeeds(
    applyPostMsgs.concat(questionPostMsgs),
    replyMsgs,
    "post",
    7,
    true
  );

  if (msgProcess.length) {
    let dealProcess = await transactionSeeds(applyPostMsgs, 12, true);

    if (dealProcess.length) {
      let dealMsgProcess = await messageSeeds(
        transMsgs,
        replyMsgs,
        "deal",
        6,
        true
      );

      if (dealMsgProcess.length) {
        process.exit(1);
      }
    }
  }
});
