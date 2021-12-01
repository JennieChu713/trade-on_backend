import express from "express";
import cors from "cors";
import session from "express-session";
import usePassport from "./config/passport.js";
import { config } from "dotenv";
import routes from "./routes/index.js";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";

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
    origin: `http://localhost:${PORT}`, //frontend URL
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// additional cookies
app.use(cookieParser());

app.set("trust proxy", 1);
// session
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "default secret",
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    //sameSite: "none",
    //secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 3,
  },
};

app.use(session(sessionConfig));

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
// const LOCALHOST_KEY = process.env.LOCALHOST_KEY || "./localhost-key.pem";
// const LOCALHOST_PEM = process.env.LOCALHOST_PEM || "./localhost.pem";
// const options = {
//   key: fs.readFileSync(LOCALHOST_KEY),
//   cert: fs.readFileSync(LOCALHOST_PEM),
// };

// const httpsServer = https.createServer(options, app);
// httpsServer.listen(PORT, () =>
//   console.log(`Listen on https://localhost:${PORT}`)
// );
