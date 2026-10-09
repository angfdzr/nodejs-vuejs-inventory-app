const { Op } = require("sequelize");
const { sequelize, TransaksiMasuk, Barang, Supplier, Pengguna } = require("../models");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");
const ApiError = require("../utils/ApiError");

const getAll = async (query) => {
    const { page, limit, offset } = getPagination(query);
    const { id_barang, id_supplier, tanggal_awal, tanggal_akhir } = query;

    const filter = {};
    if (id_barang) filter.id_barang = id_barang;
    if (id_supplier) filter.id_supplier = id_supplier;
    if (tanggal_awal && tanggal_akhir) {
        filter.tanggal = { [Op.between]: [tanggal_awal, tanggal_akhir] };
    }

    const { count, rows } = await TransaksiMasuk.findAndCountAll({
        where: filter,
        limit,
        offset,
        order: [["id_transaksi_masuk", "DESC"]],
        include: [
            { model: Barang, attributes: ["id_barang", "nama_barang", "satuan"] },
            { model: Supplier, attributes: ["id_supplier", "nama_supplier"] },
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

        const transaksi = await TransaksiMasuk.create({ ...data, id_user }, { transaction: t });

        barang.stok_saat_ini += Number(data.jumlah);
        await barang.save({ transaction: t });

        await t.commit();
        return transaksi;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const getExportData = async ({ tanggal_awal, tanggal_akhir, id_barang, id_supplier }) => {
    const filter = { tanggal: { [Op.between]: [tanggal_awal, tanggal_akhir] } };
    if (id_barang) filter.id_barang = id_barang;
    if (id_supplier) filter.id_supplier = id_supplier;

    const rows = await TransaksiMasuk.findAll({
        where: filter,
        order: [["tanggal", "ASC"]],
        include: [
            { model: Barang, attributes: ["nama_barang", "satuan"] },
            { model: Supplier, attributes: ["nama_supplier"] },
            { model: Pengguna, attributes: ["nama"] }
        ]
    });

    return rows.map((r) => ({
        tanggal: r.tanggal,
        nama_barang: r.Barang?.nama_barang || "-",
        jumlah: r.jumlah,
        satuan: r.Barang?.satuan || "-",
        supplier: r.Supplier?.nama_supplier || "-",
        dicatat_oleh: r.Pengguna?.nama || "-",
        keterangan: r.keterangan || "-"
    }));
};

module.exports = { getAll, create, getExportData };