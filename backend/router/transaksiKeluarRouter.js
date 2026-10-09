const express = require("express");
const router = express.Router();
const transaksiKeluarController = require("../controllers/transaksiKeluarController");
const { requireAuth } = require("../middlewares/authMiddleware");

router.use(requireAuth);

router.get("/", transaksiKeluarController.getAll);
router.post("/", transaksiKeluarController.create);
router.get("/export", transaksiKeluarController.exportCsv);

module.exports = router;