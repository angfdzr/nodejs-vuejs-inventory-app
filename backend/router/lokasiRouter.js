const express = require("express");
const router = express.Router();
const lokasiController = require("../controllers/lokasiController");
const { requireAuth, requireRole } = require("../middlewares/authMiddleware");

router.use(requireAuth);

router.get("/", lokasiController.getAll);
router.get("/:id", lokasiController.getById);
router.post("/", requireRole("admin"), lokasiController.create);
router.put("/:id", requireRole("admin"), lokasiController.update);
router.delete("/:id", requireRole("admin"), lokasiController.remove);

module.exports = router;