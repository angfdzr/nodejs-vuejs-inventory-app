const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireAuth, requireRole } = require("../middlewares/authMiddleware");

router.post("/register", requireAuth, requireRole("admin"), authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

module.exports = router;