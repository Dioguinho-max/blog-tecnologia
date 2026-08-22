const express = require("express");
const authenticateAdmin = require("../middlewares/auth");
const controller = require("../controllers/postController");

const router = express.Router();
router.get("/", controller.listPosts);
router.get("/admin/all", authenticateAdmin, controller.listAdminPosts);
router.get("/admin/stats", authenticateAdmin, controller.adminStats);
router.get("/:id", controller.getPost);
router.post("/:id/view", controller.registerView);
router.post("/", authenticateAdmin, controller.createPost);
router.put("/:id", authenticateAdmin, controller.updatePost);
router.delete("/:id", authenticateAdmin, controller.deletePost);
module.exports = router;
