const express = require("express");
const router = express.Router();
const transaksiMasukController = require("../controllers/transaksiMasukController");
const { requireAuth } = require("../middlewares/authMiddleware");

router.use(requireAuth);

router.get("/export", transaksiMasukController.exportCsv);
router.get("/", transaksiMasukController.getAll);
router.post("/", transaksiMasukController.create);

module.exports = router;