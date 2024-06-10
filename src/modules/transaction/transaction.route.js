const express = require("express");
const { getAllTransactions } = require("./transaction.controller");
const { auth } = require("../../middlewares/authoriation");

const router = express.Router();

router.get("/", [auth], getAllTransactions);

module.exports = router;
