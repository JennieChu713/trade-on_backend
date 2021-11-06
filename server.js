import express from "express";
import cors from "cors";
import { config } from "dotenv";
import routes from "./routes/index.js";

if (process.env.NODE_ENV !== "production") {
  config();
}

// App config
const app = express();
const PORT = process.env.PORT || 8081;

//middlewares
app.use(cors());
app.use(express.json());

//mongoDB connection (immediate process)
import "./config/mongoose.js";

// routes
app.use(routes);

app.listen(PORT, () => console.log(`Listen on http://localhost:${PORT}`));
