const asyncHandler = require("../utils/asyncHandler");
const kategoriService = require("../services/kategoriService");

const getAll = asyncHandler(async (req, res) => {
    const result = await kategoriService.getAll(req.query);
    res.status(200).json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
    const kategori = await kategoriService.getById(req.params.id);
    res.status(200).json({ success: true, data: kategori });
});

const create = asyncHandler(async (req, res) => {
    const kategori = await kategoriService.create(req.body);
    res.status(201).json({ success: true, message: "Kategori berhasil ditambahkan", data: kategori });
});

const update = asyncHandler(async (req, res) => {
    const kategori = await kategoriService.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Kategori berhasil diperbarui", data: kategori });
});

const remove = asyncHandler(async (req, res) => {
    await kategoriService.remove(req.params.id);
    res.status(200).json({ success: true, message: "Kategori berhasil dihapus" });
});

module.exports = { getAll, getById, create, update, remove };