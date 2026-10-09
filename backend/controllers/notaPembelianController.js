const asyncHandler = require("../utils/asyncHandler");
const notaPembelianService = require("../services/notaPembelianService");
const { sendCsv } = require("../utils/csvExporter");
const validateDateRange = require("../utils/validateDateRange");

const getAll = asyncHandler(async (req, res) => {
    const result = await notaPembelianService.getAll(req.query);
    res.status(200).json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
    const nota = await notaPembelianService.getById(req.params.id);
    res.status(200).json({ success: true, data: nota });
});

const create = asyncHandler(async (req, res) => {
    const filePath = req.file ? `/uploads/nota/${req.file.filename}` : null;
    const nota = await notaPembelianService.create(req.body, req.session.user.id_user, filePath);
    res.status(201).json({ success: true, message: "Nota pembelian berhasil disimpan", data: nota });
});

const remove = asyncHandler(async (req, res) => {
    await notaPembelianService.remove(req.params.id);
    res.status(200).json({ success: true, message: "Nota pembelian berhasil dihapus" });
});

const rekapBulanan = asyncHandler(async (req, res) => {
    const { tanggal_awal, tanggal_akhir } = req.query;
    validateDateRange(tanggal_awal, tanggal_akhir);
    const data = await notaPembelianService.getRekapBulanan(req.query);
    res.status(200).json({ success: true, data });
});

const exportCsv = asyncHandler(async (req, res) => {
    const { tanggal_awal, tanggal_akhir } = req.query;
    validateDateRange(tanggal_awal, tanggal_akhir);

    const data = await notaPembelianService.getExportData(req.query);
    const fields = [
        { label: "Tanggal", value: "tanggal" },
        { label: "Nomor Nota", value: "nomor_nota" },
        { label: "Supplier", value: "supplier" },
        { label: "Nama Barang", value: "nama_barang" },
        { label: "Jumlah", value: "jumlah" },
        { label: "Satuan", value: "satuan" },
        { label: "Harga Satuan", value: "harga_satuan" },
        { label: "Subtotal", value: "subtotal" },
        { label: "Dicatat Oleh", value: "dicatat_oleh" }
    ];

    sendCsv(res, data, fields, `laporan-pembelian_${tanggal_awal}_sd_${tanggal_akhir}.csv`);
});

module.exports = { getAll, getById, create, remove, rekapBulanan, exportCsv };