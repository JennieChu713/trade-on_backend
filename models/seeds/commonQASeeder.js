import db from "../../config/mongoose.js";
import SeedGenerators from "../../utils/seedsGenerator.js";

const { commonQASeeds } = SeedGenerators;

// seeder data
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

//generate data and store
db.once("open", async () => {
  console.log("generating seed data for common QAs");

  let result = await commonQASeeds(qas, 20, true);

  if (result.length) {
    process.exit(1);
  }
});
