const express = require("express");
const { chat } = require("../controllers/chatController");
const authenticateReader = require("../middlewares/readerAuth");

const router = express.Router();
router.post("/", authenticateReader, chat);
module.exports = router;
