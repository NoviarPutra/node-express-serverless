const { config } = require("dotenv");
const express = require("express");
const router = require("./src/modules");

config();

const app = express();
const { PORT } = process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("HALLO ANJING!");
});

router(app);

app.use("*", (req, res) => {
  return res.status(404).json({ success: false, message: "Not Found" });
});

module.exports = app;
