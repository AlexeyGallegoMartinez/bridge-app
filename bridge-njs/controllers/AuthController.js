const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

function signToken(user) {
  const secret = process.env.JWT_SECRET || "change-me";
  return jwt.sign(
    { Id: user.Id, Username: user.Username, Email: user.Email },
    secret,
    { expiresIn: "7d" }
  );
}

const AuthController = {
  async register(req, res, next) {
    try {
      const { Username, Email, Password, DisplayName, AvatarUrl } = req.body;

      if (!Username || !Email || !Password) {
        return res.status(400).json({ message: "Username, Email, and Password are required" });
      }

      const existing = await User.findOne({
        where: { Username },
      });
      if (existing) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const existingEmail = await User.findOne({ where: { Email } });
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const PasswordHash = await bcrypt.hash(Password, 10);
      const user = await User.create({ Username, Email, PasswordHash, DisplayName, AvatarUrl });

      const token = signToken(user);
      res.status(201).json({
        token,
        user: {
          Id: user.Id,
          Username: user.Username,
          Email: user.Email,
          DisplayName: user.DisplayName,
          AvatarUrl: user.AvatarUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { Username, Password } = req.body;

      if (!Password || !Username) {
        return res.status(400).json({ message: "Username and Password are required" });
      }

      const user = await User.findOne({ where: { Username } });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(Password, user.PasswordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = signToken(user);
      res.json({
        token,
        user: {
          Id: user.Id,
          Username: user.Username,
          Email: user.Email,
          DisplayName: user.DisplayName,
          AvatarUrl: user.AvatarUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async me(req, res, next) {
    try {
      const user = await User.findByPk(req.user.Id, {
        attributes: ["Id", "Username", "Email", "DisplayName", "AvatarUrl"],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async updatePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password are required" });
      }

      const user = await User.findByPk(req.user.Id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isValid = await bcrypt.compare(currentPassword, user.PasswordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const PasswordHash = await bcrypt.hash(newPassword, 10);
      await user.update({ PasswordHash });
      res.json({ message: "Password updated" });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = AuthController;
