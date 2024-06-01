const express = require("express");
const { getAll, create } = require("./products.controller");
const { auth, isAdmin } = require("../../middlewares/authoriation");

const router = express.Router();

router.get("/", getAll);
router.post("/", [auth, isAdmin], create);

module.exports = router;
