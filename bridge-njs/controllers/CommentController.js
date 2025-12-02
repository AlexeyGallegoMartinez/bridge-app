const { Comment, Post, User } = require("../models");

const CommentController = {
  async getAllComments(req, res, next) {
    try {
      const comments = await Comment.findAll({
        include: [
          { model: Post, as: "post" },
          { model: User, as: "user", attributes: ["Id", "Username", "DisplayName", "AvatarUrl"] },
        ],
        order: [["CreatedAt", "DESC"]],
      });
      res.json(comments);
    } catch (error) {
      next(error);
    }
  },

  async getCommentById(req, res, next) {
    try {
      const comment = await Comment.findByPk(req.params.id, {
        include: [
          { model: Post, as: "post" },
          { model: User, as: "user", attributes: ["Id", "Username", "DisplayName", "AvatarUrl"] },
        ],
      });

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      res.json(comment);
    } catch (error) {
      next(error);
    }
  },

  async createComment(req, res, next) {
    try {
      const { PostId, Text } = req.body;

      const post = await Post.findByPk(PostId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (!Text) {
        return res.status(400).json({ message: "Text is required" });
      }

      const comment = await Comment.create({ PostId, UserId: req.user.Id, Text });
      await post.increment("CommentsCount");
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  },

  async updateComment(req, res, next) {
    try {
      const { Text } = req.body;
      const comment = await Comment.findByPk(req.params.id);

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (comment.UserId !== req.user.Id) {
        return res.status(403).json({ message: "You are not allowed to edit this comment" });
      }

      await comment.update({ Text });
      res.json(comment);
    } catch (error) {
      next(error);
    }
  },

  async deleteComment(req, res, next) {
    try {
      const comment = await Comment.findByPk(req.params.id);

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (comment.UserId !== req.user.Id) {
        return res.status(403).json({ message: "You are not allowed to delete this comment" });
      }

      const post = await Post.findByPk(comment.PostId);
      await comment.destroy();
      if (post && post.CommentsCount > 0) {
        await post.decrement("CommentsCount");
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = CommentController;
