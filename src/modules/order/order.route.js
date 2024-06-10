const express = require("express");
const { getAllOrders } = require("./order.controller");
const { auth } = require("../../middlewares/authoriation");

const router = express.Router();

router.get("/", [auth], getAllOrders);

module.exports = router;
