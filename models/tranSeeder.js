import db from "../config/mongoose.js";
import Transaction from "./transaction.js";

//seeder data
function amountRandom() {
  return Math.floor(Math.random() * 10) + 1;
}

// generate data and store
db.once("open", async () => {
  console.log("generating seed data for transaction process.");

  //clearout transaction collection data of exist
  const dataExist = await Transaction.find();
  if (dataExist) {
    await Transaction.deleteMany({});
    console.log("clearout origin document data.");
  }

  // generate 3 dummy data
  const datas = Array.from({ length: 3 }, (_, i) => {
    return { amount: Math.floor(Math.random() * 10) + 1 };
  });
  try {
    const insertedDatas = await Transaction.insertMany(datas);
    if (insertedDatas) {
      console.log("seeder completed");
      process.exit();
    }
  } catch (err) {
    console.log("generate seed data failed");
    console.error(err);
  }
});
