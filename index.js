const express = require("express");
const { config } = require("dotenv");
const router = require("./src/modules");
const morgan = require("morgan");

config();

const app = express();
const { PORT } = process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static("public"));

app.set("view engine", "pug");
app.set("views", "./src/views");

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

app.get("/", (_req, res) => {
  res.render("index", { title: "Express Serverless", message: "Welcome Anjing" });
});

router(app);

app.use("*", (req, res) => {
  return res.status(404).json({ success: false, message: "Not Found" });
});

module.exports = app;
