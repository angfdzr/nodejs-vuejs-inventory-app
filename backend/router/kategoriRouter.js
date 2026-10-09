const express = require("express");
const router = express.Router();
const kategoriController = require("../controllers/kategoriController");
const { requireAuth, requireRole } = require("../middlewares/authMiddleware");

router.use(requireAuth);

router.get("/", kategoriController.getAll);
router.get("/:id", kategoriController.getById);
router.post("/", requireRole("admin"), kategoriController.create);
router.put("/:id", requireRole("admin"), kategoriController.update);
router.delete("/:id", requireRole("admin"), kategoriController.remove);

module.exports = router;