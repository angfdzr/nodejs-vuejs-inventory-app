const asyncHandler = require("../utils/asyncHandler");
const barangService = require("../services/barangService");
const { sendCsv } = require("../utils/csvExporter");
const validateDateRange = require("../utils/validateDateRange");

const getAll = asyncHandler(async (req, res) => {
    const result = await barangService.getAll(req.query);
    res.status(200).json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
    const barang = await barangService.getById(req.params.id);
    res.status(200).json({ success: true, data: barang });
});

const create = asyncHandler(async (req, res) => {
    const barang = await barangService.create(req.body);
    res.status(201).json({ success: true, message: "Barang berhasil ditambahkan", data: barang });
});

const update = asyncHandler(async (req, res) => {
    const barang = await barangService.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Barang berhasil diperbarui", data: barang });
});

const remove = asyncHandler(async (req, res) => {
    await barangService.remove(req.params.id);
    res.status(200).json({ success: true, message: "Barang berhasil dihapus" });
});

const laporan = asyncHandler(async (req, res) => {
    const { tanggal_awal, tanggal_akhir } = req.query;
    validateDateRange(tanggal_awal, tanggal_akhir);

    const data = await barangService.getLaporanBarang(req.query);
    res.status(200).json({ success: true, data });
});

const laporanExportCsv = asyncHandler(async (req, res) => {
    const { tanggal_awal, tanggal_akhir } = req.query;
    validateDateRange(tanggal_awal, tanggal_akhir);

    const data = await barangService.getLaporanBarang(req.query);
    const fields = [
        { label: "Nama Barang", value: "nama_barang" },
        { label: "Kategori", value: "kategori" },
        { label: "Jenis", value: "jenis_barang" },
        { label: "Satuan", value: "satuan" },
        { label: "Stok Awal", value: "stok_awal" },
        { label: "Total Masuk", value: "total_masuk" },
        { label: "Total Keluar", value: "total_keluar" },
        { label: "Stok Akhir", value: "stok_akhir" }
    ];

    sendCsv(res, data, fields, `laporan-barang_${tanggal_awal}_sd_${tanggal_akhir}.csv`);
});

module.exports = { getAll, getById, create, update, remove, laporan, laporanExportCsv };