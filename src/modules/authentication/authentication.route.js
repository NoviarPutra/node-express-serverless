const express = require("express");
const { login } = require("./authentication.controller");
const router = express.Router();

router.get("/", login);

module.exports = router;
