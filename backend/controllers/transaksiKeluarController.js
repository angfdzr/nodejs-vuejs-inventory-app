const asyncHandler = require("../utils/asyncHandler");
const transaksiKeluarService = require("../services/transaksiKeluarService");
const { sendCsv } = require("../utils/csvExporter");
const validateDateRange = require("../utils/validateDateRange");

const getAll = asyncHandler(async (req, res) => {
    const result = await transaksiKeluarService.getAll(req.query);
    res.status(200).json({ success: true, ...result });
});

const create = asyncHandler(async (req, res) => {
    const transaksi = await transaksiKeluarService.create(req.body, req.session.user.id_user);
    res.status(201).json({ success: true, message: "Transaksi keluar berhasil dicatat", data: transaksi });
});

const exportCsv = asyncHandler(async (req, res) => {
    const { tanggal_awal, tanggal_akhir } = req.query;
    validateDateRange(tanggal_awal, tanggal_akhir);

    const data = await transaksiKeluarService.getExportData(req.query);
    const fields = [
        { label: "Tanggal", value: "tanggal" },
        { label: "Nama Barang", value: "nama_barang" },
        { label: "Jumlah", value: "jumlah" },
        { label: "Satuan", value: "satuan" },
        { label: "Lokasi", value: "lokasi" },
        { label: "Diambil Oleh", value: "diambil_oleh" },
        { label: "Keperluan", value: "keperluan" }
    ];

    sendCsv(res, data, fields, `transaksi-keluar_${tanggal_awal}_sd_${tanggal_akhir}.csv`);
});

module.exports = { getAll, create, exportCsv };