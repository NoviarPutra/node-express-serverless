const express = require("express");
const { getAllOrders, createOrder } = require("./order.controller");
const { auth } = require("../../middlewares/authoriation");

const router = express.Router();

router.get("/", [auth], getAllOrders);

router.post("/", [auth], createOrder);

module.exports = router;
