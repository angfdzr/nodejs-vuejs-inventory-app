const { Op } = require("sequelize");
const { Lokasi } = require("../models");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");
const ApiError = require("../utils/ApiError");

const getAll = async (query) => {
    const { page, limit, offset } = getPagination(query);
    const { search } = query;

    const filter = {};
    if (search) filter.nama_lokasi = { [Op.like]: `%${search}%` };

    const { count, rows } = await Lokasi.findAndCountAll({
        where: filter, limit, offset, order: [["id_lokasi", "DESC"]]
    });

    return buildPaginatedResponse(rows, count, page, limit);
};

const getById = async (id) => {
    const lokasi = await Lokasi.findByPk(id);
    if (!lokasi) throw new ApiError(404, "Lokasi tidak ditemukan");
    return lokasi;
};

const create = async (data) => await Lokasi.create(data);
const update = async (id, data) => (await getById(id)).update(data);
const remove = async (id) => (await getById(id)).destroy();

module.exports = { getAll, getById, create, update, remove };