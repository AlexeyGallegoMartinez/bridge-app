const { Post, Comment, User, PostLike } = require("../models");

const PostController = {
  async getAllPosts(req, res, next) {
    try {
      const posts = await Post.findAll({
        include: [
          { model: User, as: "user", attributes: ["Id", "Username", "DisplayName", "AvatarUrl"] },
          {
            model: Comment,
            as: "comments",
            include: [{ model: User, as: "user", attributes: ["Id", "Username", "DisplayName", "AvatarUrl"] }],
          },
          {
            model: PostLike,
            as: "likes",
            where: { UserId: req.user.Id },
            required: false,
            attributes: ["Id", "UserId"],
          },
        ],
        order: [["CreatedAt", "DESC"]],
      });
      const formatted = posts.map((post) => {
        const json = post.toJSON();
        return {
          ...json,
          likedByUser: Array.isArray(json.likes) && json.likes.some((l) => l.UserId === req.user.Id),
        };
      });
      res.json(formatted);
    } catch (error) {
      next(error);
    }
  },

  async getPostById(req, res, next) {
    try {
      const post = await Post.findByPk(req.params.id, {
        include: [
          { model: User, as: "user", attributes: ["Id", "Username", "DisplayName", "AvatarUrl"] },
          {
            model: Comment,
            as: "comments",
            include: [{ model: User, as: "user", attributes: ["Id", "Username", "DisplayName", "AvatarUrl"] }],
          },
          {
            model: PostLike,
            as: "likes",
            where: { UserId: req.user.Id },
            required: false,
            attributes: ["Id", "UserId"],
          },
        ],
      });

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const json = post.toJSON();
      const likedByUser = Array.isArray(json.likes) && json.likes.some((l) => l.UserId === req.user.Id);
      res.json({ ...json, likedByUser });
    } catch (error) {
      next(error);
    }
  },

  async createPost(req, res, next) {
    try {
      const { Text, ImageUrl, VideoUrl } = req.body;

      if (!Text) {
        return res.status(400).json({ message: "Text is required" });
      }

      const post = await Post.create({
        UserId: req.user.Id,
        Text,
        ImageUrl,
        VideoUrl,
      });

      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  },

  async updatePost(req, res, next) {
    try {
      const { Text, ImageUrl, VideoUrl } = req.body;
      const post = await Post.findByPk(req.params.id);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.UserId !== req.user.Id) {
        return res.status(403).json({ message: "You are not allowed to edit this post" });
      }

      await post.update({ Text, ImageUrl, VideoUrl });
      res.json(post);
    } catch (error) {
      next(error);
    }
  },

  async deletePost(req, res, next) {
    try {
      const post = await Post.findByPk(req.params.id);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.UserId !== req.user.Id) {
        return res.status(403).json({ message: "You are not allowed to delete this post" });
      }

      await post.destroy();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async likePost(req, res, next) {
    try {
      const post = await Post.findByPk(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const existing = await PostLike.findOne({
        where: { PostId: post.Id, UserId: req.user.Id },
      });

      if (existing) {
        await existing.destroy();
        if (post.LikesCount > 0) {
          await post.decrement("LikesCount");
        }
        await post.reload();
        return res.json({ Id: post.Id, LikesCount: post.LikesCount, liked: false });
      }

      await PostLike.create({ PostId: post.Id, UserId: req.user.Id });
      await post.increment("LikesCount");
      await post.reload();

      res.json({ Id: post.Id, LikesCount: post.LikesCount, liked: true });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = PostController;
