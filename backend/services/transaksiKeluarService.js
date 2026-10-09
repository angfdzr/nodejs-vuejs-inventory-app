const { Op } = require("sequelize");
const { sequelize, TransaksiKeluar, Barang, Lokasi, Pengguna } = require("../models");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");
const ApiError = require("../utils/ApiError");

const getAll = async (query) => {
    const { page, limit, offset } = getPagination(query);
    const { id_barang, id_lokasi, tanggal_awal, tanggal_akhir } = query;

    const filter = {};
    if (id_barang) filter.id_barang = id_barang;
    if (id_lokasi) filter.id_lokasi = id_lokasi;
    if (tanggal_awal && tanggal_akhir) {
        filter.tanggal = { [Op.between]: [tanggal_awal, tanggal_akhir] };
    }

    const { count, rows } = await TransaksiKeluar.findAndCountAll({
        where: filter,
        limit,
        offset,
        order: [["id_transaksi_keluar", "DESC"]],
        include: [
            { model: Barang, attributes: ["id_barang", "nama_barang", "satuan"] },
            { model: Lokasi, attributes: ["id_lokasi", "nama_lokasi"] },
            { model: Pengguna, attributes: ["id_user", "nama"] }
        ]
    });

    return buildPaginatedResponse(rows, count, page, limit);
};

const create = async (data, id_user) => {
    const t = await sequelize.transaction();
    try {
        const barang = await Barang.findByPk(data.id_barang, { transaction: t });
        if (!barang) throw new ApiError(404, "Barang tidak ditemukan");

        if (barang.stok_saat_ini < Number(data.jumlah)) {
            throw new ApiError(400, `Stok tidak mencukupi. Sisa stok: ${barang.stok_saat_ini}`);
        }

        const transaksi = await TransaksiKeluar.create({ ...data, id_user }, { transaction: t });

        barang.stok_saat_ini -= Number(data.jumlah);
        await barang.save({ transaction: t });

        await t.commit();
        return transaksi;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const getExportData = async ({ tanggal_awal, tanggal_akhir, id_barang, id_lokasi }) => {
    const filter = { tanggal: { [Op.between]: [tanggal_awal, tanggal_akhir] } };
    if (id_barang) filter.id_barang = id_barang;
    if (id_lokasi) filter.id_lokasi = id_lokasi;

    const rows = await TransaksiKeluar.findAll({
        where: filter,
        order: [["tanggal", "ASC"]],
        include: [
            { model: Barang, attributes: ["nama_barang", "satuan"] },
            { model: Lokasi, attributes: ["nama_lokasi"] },
            { model: Pengguna, attributes: ["nama"] }
        ]
    });

    return rows.map((r) => ({
        tanggal: r.tanggal,
        nama_barang: r.Barang?.nama_barang || "-",
        jumlah: r.jumlah,
        satuan: r.Barang?.satuan || "-",
        lokasi: r.Lokasi?.nama_lokasi || "-",
        diambil_oleh: r.Pengguna?.nama || "-",
        keperluan: r.keperluan || "-"
    }));
};

module.exports = { getAll, create, getExportData };