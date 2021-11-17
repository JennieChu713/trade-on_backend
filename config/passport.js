import passport from "passport";
import passportLocal from "passport-local";
import passportFacebook from "passport-facebook";
import User from "../models/user.js";

const LocalStrategy = passportLocal.Strategy;
const FacebookStrategy = passportFacebook.Strategy;

export default function usePassport(app) {
  // initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // setup local login strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email }).select("+password");
          if (!user) {
            return done(null, false, { message: "Not a registered email" });
          } else {
            const isMatch = await user.matchPasswords(password);
            if (!isMatch) {
              return done(null, false, {
                message: "Email or password incorrect",
              });
            }
            return done(null, user);
          }
        } catch (err) {
          (err) => done(err, false);
        }
      }
    )
  );

  //setup facebook strategy
  // passport.use(
  //   new FacebookStrategy(
  //     {
  //       clientID: process.env.FACEBOOK_ID,
  //       clientSecret: process.env.FACEBOOK_SECRET,
  //       callbackURL: process.env.FACEBOOK_CALLBACK,
  //       profileFields: ["email", "displayName"],
  //     },
  //     async (accessToken, refreshToken, profile, done) => {
  //       const { email, name } = profile._json;
  //       const { provider } = profile.provider;
  //       try {
  //         // login
  //         const user = await User.findOne({ email });
  //         if (user) {
  //           return done(null, user);
  //         }

  //         //register
  //         const randomPassword = Math.random().toString(36).slice(-8);
  //         const hashed = await bcrypt.hash(randomPassword, 10);
  //         if (hashed) {
  //           const newUser = await User.create({
  //             email,
  //             name,
  //             password: hashed,
  //             provider,
  //           });
  //           if (newUser) {
  //             return done(null, newUser);
  //           }
  //         }
  //       } catch (err) {
  //         (err) => done(err, false);
  //       }
  //     }
  //   )
  // );

  //setup serialize and deserialize
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const findUser = await User.findById(id).lean();
      if (findUser) {
        return done(null, findUser);
      }
    } catch (err) {
      return done(err, false);
    }
  });
}
