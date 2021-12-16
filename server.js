import express from "express";
import cors from "cors";
import usePassport from "./config/passport.js";
import { config } from "dotenv";
import routes from "./routes/index.js";

if (process.env.NODE_ENV !== "production") {
  config();
}

//mongoDB connection (immediate process)
import "./config/mongoose.js";

// App config
const app = express();
const PORT = process.env.PORT || 8081;

//middlewares
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      `http://localhost:${PORT}`,
      process.env.FRONTEND_URI,
    ], //frontend URL
  })
);
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// passport
usePassport(app);

app.disable("x-powered-by");

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user || null;
  res.locals.session = req.session;
  next();
});

// routes
app.use("/tradeon/api", routes);

//listen port (with SSL environment)
app.listen(PORT, () => console.log(`Listen on http://localhost:${PORT}`));
