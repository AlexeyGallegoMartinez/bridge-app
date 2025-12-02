const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Auth Routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const placesRoutes = require("./routes/places");

const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use(cookieParser());
// app.use("/uploads", express.static("uploads"));

const allowedOrigins =
  process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ||
  (process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []);

app.use(
  cors({
    // Allow explicit web origins, and allow native apps (no origin header)
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // mobile apps / curl
      if (allowedOrigins.length === 0) return callback(null, true); // fallback: allow all
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// API Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/places", placesRoutes);

// Global Error Handler
app.use((error, req, res, next) => {
  console.error(error);
  const status = error.statusCode || 500;
  res.status(status).json({ message: error.message, data: error.data });
});

module.exports = app;
