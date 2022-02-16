import db from "../../config/mongoose.js";
import SeedGenerators from "../../utils/seedsGenerator.js";

const { categorySeeds, postSeeds } = SeedGenerators;

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

function pickRandom(num, mode = "pick") {
  if (mode === "qnt") {
    return Math.floor(Math.random() * num) + 1;
  }
  return Math.floor(Math.random() * num);
}

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

// generate data
db.once("open", async () => {
  console.log("generating seed data of category and post");

  // category
  let categoryProcess = await categorySeeds(categories);

  // post
  if (categoryProcess.length) {
    let postProcess = await postSeeds(postSamples);

    if (postProcess.length) {
      process.exit(1);
    }
  }
});
