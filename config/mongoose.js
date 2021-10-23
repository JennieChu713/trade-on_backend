import mongoose from "mongoose";

//mongoDB URI
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/tradeon";

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected!");
}

//mongoDB connection
export default main.catch((err) => console.error(err));
