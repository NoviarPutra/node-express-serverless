// import type { Application } from "express";
// import authModules from "./authentication/authentication.route";

// const authRoute = (app: Application) => {
//   app.use("/api/authentication", authModules);
// };

// export default authRoute;
const authModules = require("./authentication/authentication.route");
module.exports = (app) => {
  app.use("/api/authentication", authModules);
};
