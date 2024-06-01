const { verify } = require("jsonwebtoken");

module.exports = {
  auth: (req, res, next) => {
    const header = req.headers;
    const token = header.authorization && header.authorization.split(" ")[1];

    if (token === null) {
      return res
        .status(401)
        .json({ code: 401, status: "UNAUTHORIZED", message: "Your token is null" });
    }
    verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res
          .status(401)
          .json({ code: 403, status: "FORBIDDEN", message: "Access denied" });
      }
      req.user = user;
      next();
    });
  },
  isAdmin: (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        code: 403,
        status: "FORBIDDEN",
        message: "Access denied, you are not an admin",
      });
    }
    next();
  },
};
