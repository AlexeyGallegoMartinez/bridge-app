const Post = require("./posts");
const Comment = require("./comments");
const User = require("./users");
const PostLike = require("./postLikes");

// =======================================================
// USER → POSTS  (NO DELETE CASCADE!)
// =======================================================
User.hasMany(Post, {
  foreignKey: "UserId",
  as: "posts",
  onDelete: "NO ACTION", // ❗ FIX: remove CASCADE
});
Post.belongsTo(User, {
  foreignKey: "UserId",
  as: "user",
});

// =======================================================
// POST → COMMENTS
// =======================================================
Post.hasMany(Comment, {
  foreignKey: "PostId",
  as: "comments",
  onDelete: "CASCADE", // OK to cascade comments when post is deleted
});
Comment.belongsTo(Post, {
  foreignKey: "PostId",
  as: "post",
});

// =======================================================
// USER → COMMENTS  (KEEP SET NULL)
// =======================================================
User.hasMany(Comment, {
  foreignKey: "UserId",
  as: "user_comments",
  onDelete: "SET NULL",
});
Comment.belongsTo(User, {
  foreignKey: "UserId",
  as: "user",
});

// =======================================================
// POST → LIKES
// =======================================================
Post.hasMany(PostLike, {
  foreignKey: "PostId",
  as: "likes",
  onDelete: "CASCADE",
});
PostLike.belongsTo(Post, {
  foreignKey: "PostId",
  as: "post",
});

// =======================================================
// USER → LIKES
// =======================================================
User.hasMany(PostLike, {
  foreignKey: "UserId",
  as: "user_likes",
  onDelete: "CASCADE",
});
PostLike.belongsTo(User, {
  foreignKey: "UserId",
  as: "user",
});

module.exports = { Post, Comment, User, PostLike };
