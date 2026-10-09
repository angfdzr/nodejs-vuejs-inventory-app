const { Op } = require("sequelize");
const { Supplier } = require("../models");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");
const ApiError = require("../utils/ApiError");

const getAll = async (query) => {
    const { page, limit, offset } = getPagination(query);
    const { search } = query;

    const filter = {};
    if (search) filter.nama_supplier = { [Op.like]: `%${search}%` };

    const { count, rows } = await Supplier.findAndCountAll({
        where: filter, limit, offset, order: [["id_supplier", "DESC"]]
    });

    return buildPaginatedResponse(rows, count, page, limit);
};

const getById = async (id) => {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) throw new ApiError(404, "Supplier tidak ditemukan");
    return supplier;
};

const create = async (data) => await Supplier.create(data);
const update = async (id, data) => (await getById(id)).update(data);
const remove = async (id) => (await getById(id)).destroy();

module.exports = { getAll, getById, create, update, remove };