const express = require("express");
const router = express.Router();
const notaPembelianController = require("../controllers/notaPembelianController");
const { requireAuth } = require("../middlewares/authMiddleware");
const uploadNota = require("../middlewares/uploadMiddleware");

router.use(requireAuth);

router.get("/rekap-bulanan", notaPembelianController.rekapBulanan);
router.get("/export", notaPembelianController.exportCsv);
router.get("/", notaPembelianController.getAll);
router.get("/:id", notaPembelianController.getById);
router.post("/", uploadNota.single("file_nota"), notaPembelianController.create);
router.delete("/:id", notaPembelianController.remove);

module.exports = router;