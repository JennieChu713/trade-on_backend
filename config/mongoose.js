import mongoose from "mongoose";

//mongoDB URI
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/tradeon";
// const MONGODB_URI =
//   process.env.MONGODB_URI ||
//   "mongodb+srv://tester:d4YpkzzpZ9wt345q@cluster0.dalyz.mongodb.net/tradeonTester?retryWrites=true&w=majority";

main().catch((err) => console.error(err));

async function main() {
  await mongoose.connect(MONGODB_URI);
}

// setup default connection for mongoose.model usage
const db = mongoose.connection;

db.on("error", () => {
  console.log("mongoDB connection error");
});
db.once("open", () => {
  console.log("mongoDB connected");
});

//mongoDB connection
export default db;
