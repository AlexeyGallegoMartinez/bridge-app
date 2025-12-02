const express = require("express");
const CommentController = require("../controllers/CommentController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", CommentController.getAllComments);
router.get("/:id", CommentController.getCommentById);
router.post("/", authenticate, CommentController.createComment);
router.put("/:id", authenticate, CommentController.updateComment);
router.delete("/:id", authenticate, CommentController.deleteComment);

module.exports = router;
