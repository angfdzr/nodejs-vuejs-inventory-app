const asyncHandler = require("../utils/asyncHandler");
const supplierService = require("../services/supplierService");

const getAll = asyncHandler(async (req, res) => {
    const result = await supplierService.getAll(req.query);
    res.status(200).json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
    const supplier = await supplierService.getById(req.params.id);
    res.status(200).json({ success: true, data: supplier });
});

const create = asyncHandler(async (req, res) => {
    const supplier = await supplierService.create(req.body);
    res.status(201).json({ success: true, message: "Supplier berhasil ditambahkan", data: supplier });
});

const update = asyncHandler(async (req, res) => {
    const supplier = await supplierService.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Supplier berhasil diperbarui", data: supplier });
});

const remove = asyncHandler(async (req, res) => {
    await supplierService.remove(req.params.id);
    res.status(200).json({ success: true, message: "Supplier berhasil dihapus" });
});

module.exports = { getAll, getById, create, update, remove };