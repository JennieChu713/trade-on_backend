import SeedGenerators from "../utils/seedsGenerator.js";
import fs from "fs";
import Post from "../models/post.js";

const {
  categorySeeds,
  postSeeds,
  commonQASeeds,
  transactionSeeds,
  messageSeeds,
  userSeeds,
  clearOutData,
  savingJson,
  restore,
} = SeedGenerators;

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

// messages with transactions
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

// users
const seedUsers = [
  {
    email: "owner@mail.com",
    nickname: "owner",
    password: "owner",
    account: {
      bankCode: "333",
      accountNum: "123456789011",
    },
  },
  {
    email: "dealer@mail.com",
    nickname: "dealer",
    password: "dealer",
  },
  {
    email: "admin@mail.com",
    nickname: "admin",
    password: "admin",
    accountAuthority: "admin",
  },
  {
    email: "mango@mail.com",
    nickname: "mango",
    password: "mango",
  },
  {
    email: "banana@mail.com",
    nickname: "banana",
    password: "banana",
  },
  {
    email: "tomato@mail.com",
    nickname: "tomato",
    password: "tomato",
  },
];
const preferMethods = [
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

// setup user structured data
let userSamples = [];
for (let user of seedUsers) {
  let dataStructure = {
    ...user,
  };

  if (user.nickname !== "tomato" && user.nickname !== "admin") {
    dataStructure.preferDealMethods =
      preferMethods[pickRandom(preferMethods.length)];
  }
  userSamples.push(dataStructure);
}

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

const postImgs = [
  "https://images.unsplash.com/photo-1558276561-95e31d860c4b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8b2JqZWN0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1563219996-45f1a0ba692e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8b2JqZWN0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1503602642458-232111445657?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8b2JqZWN0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fG9iamVjdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1509281373149-e957c6296406?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MzF8fG9iamVjdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1565656898731-61d5df85f9a7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjZ8fG9iamVjdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mjl8fG9iamVjdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1501951653466-8df816debe46?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NTB8fG9iamVjdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1567113379515-6e85e7168eb1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NjV8fG9iamVjdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1578898395216-78dae5d29344?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NjJ8fG9iamVjdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1531892311573-7d77d5394367?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OTV8fG9iamVjdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
];

//setup post structured data
let postSamples = [];
for (let i = 0; i < 30; i++) {
  let imgUrls = [];
  let imgAmount = pickRandom(10, "qnt");
  for (let i = 0; i < imgAmount; i++) {
    if (imgAmount === 1) {
      imgUrls.push({ imgUrl: undefined });
    } else {
      imgUrls.push({ imgUrl: postImgs[pickRandom(postImgs.length)] });
    }
  }
  let dataStructure = {
    itemName: items[pickRandom(items.length)],
    quantity: pickRandom(10, "qnt"),
    imgUrls,
    itemStatus: pickRandom(15) % 2 === 0 ? "全新" : "二手",
    description: descripts[pickRandom(descripts.length)],
    tradingOptions: tradings[pickRandom(tradings.length)],
  };
  postSamples.push(dataStructure);
}

// random functions
function pickRandom(num, mode = "pick") {
  if (mode === "qnt") {
    return Math.floor(Math.random() * num) + 1;
  }
  return Math.floor(Math.random() * num);
}

export const resetting = async (req, res, next) => {
  const { type } = req.query;
  switch (type) {
    case "commonqnas":
      let commonQAsProcess = await commonQASeeds(qas, 20, true);
      return res.status(200).json({
        message: `success; reset commonQAs with ${commonQAsProcess.length} samples.`,
      });

    case "posts":
      let categoryProcess = await categorySeeds(categories);
      let postProcess;
      if (categoryProcess.length) {
        postProcess = await postSeeds(postSamples);
      }
      return res.status(200).json({
        message: `success; reset posts of ${postProcess.length} samples and categories of ${categoryProcess.length} samples.`,
      });

    case "messages":
      let msgProcess = await messageSeeds(
        applyPostMsgs.concat(questionPostMsgs),
        replyMsgs,
        "post",
        7,
        true
      );
      return res.status(200).json({
        message: `success; reset post messages with random replies of ${msgProcess.length} samples`,
      });

    case "transactions":
      let dealProcess = await transactionSeeds(applyPostMsgs, 12, true);
      let dealMsgProcess;
      if (dealProcess.length) {
        dealMsgProcess = await messageSeeds(
          transMsgs,
          replyMsgs,
          "deal",
          6,
          true
        );
      }
      return res.status(200).json({
        message: `success; reset transaction with related apply messages random replies of ${dealProcess.length} samples,\n transaction messages with random replies of ${dealMsgProcess.length} samples.`,
      });

    case "users":
      let usersProcess = await userSeeds(userSamples);
      return res.status(200).json({
        message: `success; reset users of ${usersProcess.length} samples.`,
      });

    // case "all":
    //   await clearOutData();
    //   return res.status(200).json({
    //     message: `success; clear all data.`,
    //   });
  }
};

export const savingPoint = async (req, res, next) => {
  try {
    let result = await savingJson();
    return res.status(200).json({ message: "success", result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const restoreData = async (req, res, next) => {
  try {
    let result = await restore();
    if (result) {
      return res.status(200).json({ message: "success" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
