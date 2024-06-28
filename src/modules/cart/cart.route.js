const express = require("express");
const { getCartByUserId, insertCart } = require("./cart.controller");
const { auth } = require("../../middlewares/authoriation");
const router = express.Router();

router.get("/", [auth], getCartByUserId);

router.post("/", [auth], insertCart);

module.exports = router;
