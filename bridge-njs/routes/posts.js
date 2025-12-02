const express = require("express");
const PostController = require("../controllers/PostController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, PostController.getAllPosts);
router.get("/:id", authenticate, PostController.getPostById);
router.post("/", authenticate, PostController.createPost);
router.put("/:id", authenticate, PostController.updatePost);
router.delete("/:id", authenticate, PostController.deletePost);
router.post("/:id/like", authenticate, PostController.likePost);

module.exports = router;
