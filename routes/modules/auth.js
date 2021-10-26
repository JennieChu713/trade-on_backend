import express from "express";
import passport from "passport";

const router = express.Router();

// login with facebook authentication
router.get(
  "/facebook",
  passport.authenticate({ scope: ["email", "public_profile"] })
);

// response from facebook
router.get(
  "/facebook/callback",
  passport.authenticate(
    "facebook",
    { failureMessage: "login failed" },
    (req, res) => {
      res.status(200).json({ message: "success" });
    }
  )
);

export default router;
