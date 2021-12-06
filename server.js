import express from "express";
import cors from "cors";
import session from "express-session";
import usePassport from "./config/passport.js";
import { config } from "dotenv";
import routes from "./routes/index.js";
<<<<<<< HEAD
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
=======
>>>>>>> user

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
<<<<<<< HEAD
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
    sameSite: "none",
    //secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 3,
  },
};

app.use(session(sessionConfig));
=======
// app.use(express.urlencoded({ extended: false }));

// // session
// const sessionConfig = {
//   secret: process.env.SESSION_SECRET || "default secret",
//   store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     maxAge: 1000 * 60 * 60 * 24 * 3,
//   },
// };

// app.use(session(sessionConfig));
>>>>>>> user

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
