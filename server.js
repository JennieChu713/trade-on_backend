import express from "express";
import cors from "cors";

// App config
const app = express();

//middlewares
app.use(cors());
app.use(express.json());
