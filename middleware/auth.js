import passport from "passport";

export default class AuthenticateMiddlewares {
  static authenticator(req, res, next) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.locals.user = req.user;
    next();
  }

  static verifyLogin(req, res, next) {
    passport.authenticate(
      "local",
      { session: false },
      function (err, user, info) {
        if (err) {
          return next(err);
        }
        if (!user) {
          console.log("!user");
          return res.json(info);
        }
        req.logIn(user, function (err) {
          if (err) {
            return next(err);
          }
          next();
        });
      }
    )(req, res, next);
  }

  static checkToken(req, res, next) {
    passport.authenticate(
      "jwt",
      { session: false },
      function (err, user, info) {
        if (err) {
          return next(err);
        }
        if (req.headers.authorization.split(" ").length === 1) {
          return res.json({
            message: "No token provided; login or register first",
          });
        }

        if (!user) {
          return res.json(info);
        }
        next();
      }
    )(req, res, next);
  }
}
