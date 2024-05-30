const authModules = require("./authentication/authentication.route");
module.exports = (app) => {
  app.use("/api/authentication", authModules);
};
