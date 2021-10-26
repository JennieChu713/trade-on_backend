import db from "../config/mongoose.js";
import Category from "./category.js";

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

function pickRandom(num) {
  return Math.floor(Math.random() * num);
}
//generate data and store
db.once("open", async () => {
  console.log("generating seed data for category");

  // clearout common_qas collection data if exist.
  const dataExist = await Category.find();
  if (dataExist.length) {
    await Category.deleteMany({});
    console.log("clearout origin document data.");
  }

  // generate 15 dummy data
  Array.from({ length: 15 }, async (_, i) => {
    try {
      await Category.create({
        categoryName: categories[pickRandom(categories.length)],
      });
      if (i === 14) {
        console.log("seeder data complete.");
        process.exit();
      }
    } catch (err) {
      console.log("generate seed data failed");
      console.error(err);
    }
  });
});
