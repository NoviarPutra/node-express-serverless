const express = require("express");
const { uploadFile } = require("./upload.controller");

const router = express.Router();

router.post("/", uploadFile);

module.exports = router;
