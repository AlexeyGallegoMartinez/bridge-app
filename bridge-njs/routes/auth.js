const express = require("express");
const AuthController = require("../controllers/AuthController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authenticate, AuthController.me);
router.put("/password", authenticate, AuthController.updatePassword);

module.exports = router;
