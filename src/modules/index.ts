import { Application } from "express";
import authModules from "./authentication/authentication.route";

const authRoute = (app: Application) => {
  app.use("/api/authentication", authModules);
};

export default authRoute;
