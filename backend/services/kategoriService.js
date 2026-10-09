const { Op } = require("sequelize");
const { Kategori } = require("../models");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");
const ApiError = require("../utils/ApiError");

const getAll = async (query) => {
    const { page, limit, offset } = getPagination(query);
    const { search } = query;

    const filter = {};
    if (search) filter.nama_kategori = { [Op.like]: `%${search}%` };

    const { count, rows } = await Kategori.findAndCountAll({
        where: filter,
        limit,
        offset,
        order: [["id_kategori", "DESC"]]
    });

    return buildPaginatedResponse(rows, count, page, limit);
};

const getById = async (id) => {
    const kategori = await Kategori.findByPk(id);
    if (!kategori) throw new ApiError(404, "Kategori tidak ditemukan");
    return kategori;
};

const create = async (data) => await Kategori.create(data);

const update = async (id, data) => {
    const kategori = await getById(id);
    return await kategori.update(data);
};

const remove = async (id) => {
    const kategori = await getById(id);
    await kategori.destroy();
};

module.exports = { getAll, getById, create, update, remove };