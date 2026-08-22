const express = require("express");
const authenticateReader = require("../middlewares/readerAuth");
const authenticateAdmin = require("../middlewares/auth");
const controller = require("../controllers/commentController");
const router = express.Router();

router.get("/posts/:postId", controller.listPublished);
router.post("/posts/:postId", authenticateReader, controller.create);
router.get("/posts/:postId/mine", authenticateReader, controller.listMine);
router.delete("/posts/mine/:id", authenticateReader, controller.removeMine);
router.get("/admin/all", authenticateAdmin, controller.listAdmin);
router.put("/admin/:id/publish", authenticateAdmin, controller.publish);
router.delete("/admin/:id", authenticateAdmin, controller.remove);
module.exports = router;
