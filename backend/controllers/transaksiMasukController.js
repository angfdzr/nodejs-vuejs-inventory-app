const asyncHandler = require("../utils/asyncHandler");
const transaksiMasukService = require("../services/transaksiMasukService");
const { sendCsv } = require("../utils/csvExporter");
const validateDateRange = require("../utils/validateDateRange");

const getAll = asyncHandler(async (req, res) => {
    const result = await transaksiMasukService.getAll(req.query);
    res.status(200).json({ success: true, ...result });
});

const create = asyncHandler(async (req, res) => {
    const transaksi = await transaksiMasukService.create(req.body, req.session.user.id_user);
    res.status(201).json({ success: true, message: "Transaksi masuk berhasil dicatat", data: transaksi });
});

const exportCsv = asyncHandler(async (req, res) => {
    const { tanggal_awal, tanggal_akhir } = req.query;
    validateDateRange(tanggal_awal, tanggal_akhir);

    const data = await transaksiMasukService.getExportData(req.query);
    const fields = [
        { label: "Tanggal", value: "tanggal" },
        { label: "Nama Barang", value: "nama_barang" },
        { label: "Jumlah", value: "jumlah" },
        { label: "Satuan", value: "satuan" },
        { label: "Supplier", value: "supplier" },
        { label: "Dicatat Oleh", value: "dicatat_oleh" },
        { label: "Keterangan", value: "keterangan" }
    ];

    sendCsv(res, data, fields, `transaksi-masuk_${tanggal_awal}_sd_${tanggal_akhir}.csv`);
});

module.exports = { getAll, create, exportCsv };