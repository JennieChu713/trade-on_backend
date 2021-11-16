import express from "express";
import cors from "cors";
import session from "express-session";
import usePassport from "./config/passport.js";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import MongoStore from "connect-mongo";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

//mongoDB connection (immediate process)
import "./config/mongoose.js";

// App config
const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

MongoStore(session);

// session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// passport
usePassport(app);

// app.use((req, res, next) => {
//   res.locals.isAuthenticated = req.isAuthenticated();
//   res.locals.user = req.user;
//   next();
// });

// routes
app.use(routes);

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
