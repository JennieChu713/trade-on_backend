import mongoose from "mongoose";
import { config } from "dotenv";

if (process.env.NODE_ENV !== "production") {
  config();
}

//mongoDB URI
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_NAME = process.env.MONGODB_NAME || "tradeonTester";
const MONGODB_URI =
  process.env.MONGODB_URI ||
  `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.dalyz.mongodb.net/${MONGODB_NAME}?retryWrites=true&w=majority`;

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
