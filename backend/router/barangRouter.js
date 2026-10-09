const express = require("express");
const router = express.Router();
const barangController = require("../controllers/barangController");
const { requireAuth, requireRole } = require("../middlewares/authMiddleware");

router.use(requireAuth);

router.get("/laporan/export", barangController.laporanExportCsv);
router.get("/laporan", barangController.laporan);

router.get("/", barangController.getAll);
router.get("/:id", barangController.getById);
router.post("/", requireRole("admin"), barangController.create);
router.put("/:id", requireRole("admin"), barangController.update);
router.delete("/:id", requireRole("admin"), barangController.remove);

module.exports = router;