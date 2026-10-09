const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRouter"));
router.use("/kategori", require("./kategoriRouter"));
router.use("/lokasi", require("./lokasiRouter"));
router.use("/supplier", require("./supplierRouter"));
router.use("/barang", require("./barangRouter"));
router.use("/nota-pembelian", require("./notaPembelianRouter"));
router.use("/transaksi-keluar", require("./transaksiKeluarRouter"));

module.exports = router;