const express = require("express");
const { getCartByUserId } = require("./cart.controller");
const router = express.Router();

router.get("/:userId", getCartByUserId);

module.exports = router;
