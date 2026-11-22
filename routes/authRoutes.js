
const express = require("express");
const router = express.Router();

const {
    signup,
    login,
    getMe,
    refreshAccessToken
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
// Protected route
router.get("/me", protect, getMe);

module.exports = router;
