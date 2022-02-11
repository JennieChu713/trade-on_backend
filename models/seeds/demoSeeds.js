import db from "../../config/mongoose.js";
import SeedGenerators from "../../utils/seedsGenerator.js";

const { clearOutData, categorySeeds, userSeeds, commonQASeeds, postSeeds } =
  SeedGenerators;

// category
const categories = [
  "配件飾品",
  "3C電器",
  "美妝香氛",
  "衣飾配件",
  "居家雜貨",
  "辦公文具",
  "書籍讀物",
  "寵物用品",
  "親子育幼",
  "運動器材",
  "其他", // 同 "未分類"
];

// user
const users = [
  {
    email: "evergreen111@example.com",
    password: "evergreen111", //6 char+num
    nickname: "不能再綠惹",
    description: '"向世界分享更多美好。"',
    preferDealMethods: {
      selectedMethods: ["7-11", "全家", "面交"],
      faceToFace: {
        region: "臺北市",
        district: "萬華區",
      },
    },
  },
  {
    email: "snowball0913@ggmail.com",
    password: "snowball0913",
    nickname: "雪球白",
    description: "純粹的祝福，祈願世界和平。",
    preferDealMethods: {
      selectedMethods: ["7-11", "全家"],
    },
  },
  {
    email: "admin123@mail.com",
    password: "admin123",
    nickname: "管理員是我",
    accountAuthority: "admin",
  },
  {
    email: "cinnamon888bunbun@yufoo.tw",
    password: "cinnamon888bunbun",
    nickname: "肉桂幫幫",
  },
];

// commonQnA
const qas = [
  {
    question: "請問要怎麼樣才能使用 Tradeon 的服務呢？",
    answer: "只要註冊成為 Tradeon 的會員即可。",
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
    question: "要如何贈送物品？",
    answer:
      "您要先新增刊登，並依照欄位填寫物品的狀態與數量等，完成送出後便會刊登在首頁中。當有人申請索取時便可以開始進行贈送了！",
  },
  {
    question: "要怎麼知道現在有多少索取交易在進行？",
    answer:
      "只要點選右上角頭像，選擇「所有交易」，就可以進入頁面瀏覽。若要查看個別交易的部分，點入個別卡片便可看。",
  },
  {
    question: "如何取消交易？",
    answer: "在尚未付費的情況下方可取消交易。",
  },
  {
    question: "為什麼會有無法刪除刊登的情況？",
    answer:
      "這表示和該刊登有關的索取交易有部分已經經過付費的階段，您必須先完成那些交易流程才可刪除刊登。",
  },
  {
    question: "為什麼有的刊登無法再新增索取交易？",
    answer:
      "這是因為和該刊登有關的索取交易中的數量總和已經達到上限（該刊登狀態上會顯示「交易進行中」）。除非將之前的任一交易取消，否則無法再進行新的索取交易。",
  },
  {
    question: "已經取消的索取交易可以再恢復嗎？",
    answer: "目前已經取消的交易無法再恢復，若有需要請重新一筆新的索取交易。",
  },

  {
    question: "要怎麼知道索取交易進行的程度？",
    answer:
      "每一筆索取交易的進程分別為「索取中」、「付款中」、「寄送中」以及「交易完成」。每一階段完成後就會自動進入下一個階段。\n若選擇便利商店的交易方式，則會有「索取中」和「付款中」的階段；\n若採用面交的方式，則會從「寄送中」階段開始，並與對方透過鎖交易留言板約好時間，再實際面交完畢後再點選「交易完成」完成該筆索取交易。",
  },
];

//post
const posts = [
  {
    itemName: "月光石項鍊",
    quantity: 1,
    itemStatus: "二手",
    description:
      "很久以前買的月光石項鍊，但幾乎沒戴過，所以就想趁這次整理家裡的時候出清。\n月光石據說可以提升女性魅力和愛情運喔！如果想要的話歡迎索取:)",
    category: "配件飾品", // 純標示，因為實際存入要透過品項名來找 id
  },
  {
    itemName: "空白筆記本",
    quantity: 7,
    itemStatus: "二手",
    description: "從小時候累積到現在的空白筆記本。",
    category: "辦公文具",
  },
  {
    itemName: "鳥類木雕飾品",
    quantity: 4,
    itemStatus: "全新",
    description: "今年大掃除才發現這些東西的存在，如果喜歡請跟我說。",
    category: "居家雜貨",
  },
  {
    itemName: "兔子布偶",
    quantity: 2,
    itemStatus: "全新",
    description: "小時候的禮物，希望能找到珍惜它的人。",
    category: "親子育幼",
  },
  {
    itemName: "【一組送】漫畫家有賤狗Bow-Wow 1-14(完)",
    quantity: 1,
    itemStatus: "二手",
    description: "外觀有黃斑，輕微折損（請參考圖片）。若不介意歡迎索取，感謝。",
    category: "書籍讀物",
  },
  {
    itemName: "(可分送) 龍族 第一部",
    quantity: 12,
    itemStatus: "二手",
    description:
      "全部 12 集。除了書角有些微磨損，書頁翻閱的狀況OK。雖然能拿一整組是最理想的，但也可以接受索取想要的集數。\n索取時請告知要拿哪幾集或是要拿一組。會優先考量拿整組的人，謝謝。",
    category: "書籍讀物",
  },
  {
    itemName: "短袖洋裝 S 平常外出或稍微正式場合皆合適",
    quantity: 1,
    itemStatus: "全新",
    description:
      "只穿過一次。\n本人166 50kg。衣長平量 140 公分，腰間 31.8 公分，適合 24 ~ 28 腰。",
    category: "衣飾配件",
  },
  {
    itemName: "香氛蠟燭",
    quantity: 6,
    itemStatus: "全新",
    description:
      "聖誕節抽到的禮物，但本身沒有用香氛的習慣，所以送給有興趣的人。",
    category: "美妝香氛",
  },
  {
    itemName: "針織斗篷",
    quantity: 2,
    itemStatus: "全新",
    description: "豆沙紅和灰麻色各一件。",
    category: "衣飾配件",
  },
  {
    itemName: "N1 日文檢定參考書",
    quantity: 8,
    itemStatus: "二手",
    description: "考過N1檢定，所以轉送給需要的人。\n預祝順利通過！",
    category: "書籍讀物",
  },

  {
    itemName: "無動力木頭模型組件",
    quantity: 4,
    itemStatus: "全新",
    description: "買了很久一直沒機會組，決定釋出。",
    category: "親子育幼",
  },
  {
    itemName: "時尚造型墨鏡",
    quantity: 1,
    itemStatus: "二手",
    description: "在外地旅遊買的紀念品，但從來沒用過，所以想出清。",
    category: "配件飾品",
  },
  {
    itemName: "塑膠片組合櫃",
    quantity: 1,
    itemStatus: "二手",
    description: "大學時期買的組合櫃，組裝容易也輕巧，不過不能放太重的東西。",
    category: "居家雜貨",
  },
  {
    itemName: "商業設計工具",
    quantity: 5,
    itemStatus: "二手",
    description: "高中唸商設的工具，如果需要歡迎索取。",
    category: "辦公文具",
  },
  {
    itemName: "藍芽造型鍵盤",
    quantity: 1,
    itemStatus: "二手",
    description:
      "當初覺得很漂亮所以衝動買了下來，但實際沒用過幾次，所以決定讓出。",
    category: "3C電器",
  },
  {
    itemName: "背包",
    quantity: 1,
    itemStatus: "二手",
    description: "就學時期使用的背包。",
    category: "配件飾品",
  },
  {
    itemName: "寵物食盆碗架組",
    quantity: 2,
    itemStatus: "二手",
    description: "家裡的寶貝走了⋯⋯所以想給需要的人。",
    category: "寵物用品",
  },
  {
    itemName: "古典風鈴",
    quantity: 1,
    itemStatus: "二手",
    category: "居家雜貨",
  },
  {
    itemName: "運動隨行水壺",
    quantity: 3,
    itemStatus: "全新",
    description: "家裡水壺太多，想清點空間出來。",
    category: "運動器材",
  },
  {
    itemName: "鋼筆",
    quantity: 1,
    itemStatus: "二手",
    description: "曾經熱衷一段時間，不過現在退燒了⋯⋯",
    category: "辦公文具",
  },

  {
    itemName: "圍巾",
    quantity: 10,
    itemStatus: "二手",
    description:
      "收集了很多，但最後只固定用幾條，所以決定出讓。喜歡的話歡迎索取。",
    category: "衣飾配件",
  },
  {
    itemName: "電氣石手環",
    quantity: 1,
    itemStatus: "全新",
    description: "完全沒戴過。",
    category: "配件飾品",
  },
  {
    itemName: "香水迷你組",
    quantity: 1,
    itemStatus: "二手",
    description: "當初嚐鮮買的香水。",
    category: "美妝香氛",
  },
  {
    itemName: "水彩毛筆組",
    quantity: 1,
    itemStatus: "二手",
    category: "辦公文具",
  },
  {
    itemName: "紙膠帶",
    quantity: 13,
    itemStatus: "二手",
    description: "索取時請告訴我編號，感恩！",
    category: "辦公文具",
  },
  {
    itemName: "羽絨外套",
    quantity: 1,
    itemStatus: "二手",
    category: "衣飾配件",
  },
  {
    itemName: "碗盤組",
    quantity: 3,
    itemStatus: "全新",
    description: "沒用過",
    category: "居家雜貨",
  },
  {
    itemName: "貓咪擺飾",
    quantity: 5,
    itemStatus: "二手",
    description: "瓷製品、木雕刻都有。",
    category: "居家雜貨",
  },
  {
    itemName: "音樂盒",
    quantity: 1,
    itemStatus: "二手",
    category: "居家雜貨",
  },
  {
    itemName: "CD",
    quantity: 4,
    itemStatus: "二手",
    description: "家裡沒有播放器了，所以轉送。",
    category: "其他",
  },
];

db.once("open", async () => {
  try {
    // drop collections to clearout data
    let clear = await clearOutData();

    if (clear) {
      let completeCateogry = await categorySeeds(categories);
      let completeQAs = await commonQASeeds(qas);

      if (completeCateogry.length && completeQAs.length) {
        let completeUsers = await userSeeds(users);

        if (completeUsers.length) {
          let completePosts = await postSeeds(
            posts,
            undefined,
            undefined,
            "demo"
          );
          if (completePosts.length) {
            process.exit(0);
          }
        }
      }
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
});
