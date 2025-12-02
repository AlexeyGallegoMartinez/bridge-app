const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Post = sequelize.define(
  "Post",
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    Text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    ImageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    VideoUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    LikesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    CommentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "Posts",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

module.exports = Post;
