export const authenticator = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.locals.user = req.user;
  next();
};
