const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const PostLike = sequelize.define(
  "PostLike",
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    PostId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "PostLikes",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
    indexes: [
      {
        unique: true,
        fields: ["PostId", "UserId"],
      },
    ],
  }
);

module.exports = PostLike;
