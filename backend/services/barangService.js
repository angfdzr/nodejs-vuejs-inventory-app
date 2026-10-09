const { Op, where: sequelizeWhere, col } = require("sequelize");
const { Barang, Kategori } = require("../models");
const { TransaksiMasuk, TransaksiKeluar, NotaPembelian } = require("../models");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");
const ApiError = require("../utils/ApiError");

const getAll = async (query) => {
    const { page, limit, offset } = getPagination(query);
    const { search, id_kategori, jenis_barang, stok_menipis } = query;

    const filter = {};
    const andConditions = [];

    if (search) filter.nama_barang = { [Op.like]: `%${search}%` };
    if (id_kategori) filter.id_kategori = id_kategori;
    if (jenis_barang) filter.jenis_barang = jenis_barang;

    if (stok_menipis === "true") {
        andConditions.push(sequelizeWhere(col("stok_saat_ini"), Op.lte, col("stok_minimum")));
    }

    const { count, rows } = await Barang.findAndCountAll({
        where: andConditions.length ? { ...filter, [Op.and]: andConditions } : filter,
        limit,
        offset,
        order: [["id_barang", "DESC"]],
        include: [{ model: Kategori, attributes: ["id_kategori", "nama_kategori"] }]
    });

    return buildPaginatedResponse(rows, count, page, limit);
};

const getById = async (id) => {
    const barang = await Barang.findByPk(id, {
        include: [{ model: Kategori, attributes: ["id_kategori", "nama_kategori"] }]
    });
    if (!barang) throw new ApiError(404, "Barang tidak ditemukan");
    return barang;
};

const create = async (data) => await Barang.create(data);
const update = async (id, data) => (await getById(id)).update(data);
const remove = async (id) => (await getById(id)).destroy();

const getLaporanBarang = async ({ tanggal_awal, tanggal_akhir, id_kategori, jenis_barang }) => {
    const filter = {};
    if (id_kategori) filter.id_kategori = id_kategori;
    if (jenis_barang) filter.jenis_barang = jenis_barang;

    const barangList = await Barang.findAll({
        where: filter,
        include: [{ model: Kategori, attributes: ["nama_kategori"] }],
        order: [["nama_barang", "ASC"]]
    });

    const hasil = [];
    for (const barang of barangList) {
        const totalMasuk = await TransaksiMasuk.sum("jumlah", {
            where: { id_barang: barang.id_barang },
            include: [{
                model: NotaPembelian,
                attributes: [],
                where: { tanggal: { [Op.between]: [tanggal_awal, tanggal_akhir] } }
            }]
        }) || 0;

        const totalKeluar = await TransaksiKeluar.sum("jumlah", {
            where: {
                id_barang: barang.id_barang,
                tanggal: { [Op.between]: [tanggal_awal, tanggal_akhir] }
            }
        }) || 0;

        const stokAkhir = barang.stok_saat_ini;
        const stokAwal = stokAkhir - totalMasuk + totalKeluar;

        hasil.push({
            nama_barang: barang.nama_barang,
            kategori: barang.Kategori?.nama_kategori || "-",
            jenis_barang: barang.jenis_barang === "habis_pakai" ? "Habis pakai" : "Tidak habis pakai",
            satuan: barang.satuan,
            stok_awal: stokAwal,
            total_masuk: totalMasuk,
            total_keluar: totalKeluar,
            stok_akhir: stokAkhir
        });
    }
    return hasil;
};

module.exports = { getAll, getById, create, update, remove, getLaporanBarang };