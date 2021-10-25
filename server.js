import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import routes from "./routes/index.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// App config
const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(cors());
app.use(express.json());

//mongoDB connection (immediate process)
import "./config/mongoose.js";

// routes
app.use(routes);

//listen port
app.listen(PORT, () => console.log(`Listen on http://localhost:${PORT}`));
