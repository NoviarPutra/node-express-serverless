import express, { Application, Request, Response } from "express";
import { config } from "dotenv";
import router from "./src/modules";
import morgan from "morgan";

config();

const app: Application = express();
const { PORT } = process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

app.get("/", (req: Request, res: Response) => {
  res.send("HALLO ANJING!");
});

router(app);

app.use("*", (req: Request, res: Response) => {
  return res.status(404).json({ success: false, message: "Not Found" });
});

module.exports = app;
