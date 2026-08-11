const express = require("express");
const { sitemap } = require("../controllers/seoController");

const router = express.Router();
router.get("/sitemap.xml", sitemap);
module.exports = router;
