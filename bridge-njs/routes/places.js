const express = require("express");
const PlacesController = require("../controllers/PlacesController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, PlacesController.search);

module.exports = router;
