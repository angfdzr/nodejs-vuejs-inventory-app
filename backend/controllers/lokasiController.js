const asyncHandler = require("../utils/asyncHandler");
const lokasiService = require("../services/lokasiService");

const getAll = asyncHandler(async (req, res) => {
    const result = await lokasiService.getAll(req.query);
    res.status(200).json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
    const lokasi = await lokasiService.getById(req.params.id);
    res.status(200).json({ success: true, data: lokasi });
});

const create = asyncHandler(async (req, res) => {
    const lokasi = await lokasiService.create(req.body);
    res.status(201).json({ success: true, message: "Lokasi berhasil ditambahkan", data: lokasi });
});

const update = asyncHandler(async (req, res) => {
    const lokasi = await lokasiService.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Lokasi berhasil diperbarui", data: lokasi });
});

const remove = asyncHandler(async (req, res) => {
    await lokasiService.remove(req.params.id);
    res.status(200).json({ success: true, message: "Lokasi berhasil dihapus" });
});

module.exports = { getAll, getById, create, update, remove };