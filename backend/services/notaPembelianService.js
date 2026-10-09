const { Op } = require("sequelize");
const { sequelize, NotaPembelian, TransaksiMasuk, Barang, Supplier, Pengguna } = require("../models");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");
const ApiError = require("../utils/ApiError");

const getAll = async (query) => {
    const { page, limit, offset } = getPagination(query);
    const { search, id_supplier, tanggal_awal, tanggal_akhir } = query;

    const filter = {};
    if (search) filter.nomor_nota = { [Op.like]: `%${search}%` };
    if (id_supplier) filter.id_supplier = id_supplier;
    if (tanggal_awal && tanggal_akhir) {
        filter.tanggal = { [Op.between]: [tanggal_awal, tanggal_akhir] };
    }

    const { count, rows } = await NotaPembelian.findAndCountAll({
        where: filter,
        limit,
        offset,
        order: [["tanggal", "DESC"], ["id_nota", "DESC"]],
        include: [
            { model: Supplier, attributes: ["id_supplier", "nama_supplier"] },
            { model: Pengguna, attributes: ["id_user", "nama"] }
        ]
    });

    return buildPaginatedResponse(rows, count, page, limit);
};

const getById = async (id) => {
    const nota = await NotaPembelian.findByPk(id, {
        include: [
            { model: Supplier, attributes: ["id_supplier", "nama_supplier"] },
            { model: Pengguna, attributes: ["id_user", "nama"] },
            {
                model: TransaksiMasuk,
                as: "rincian",
                include: [{ model: Barang, attributes: ["id_barang", "nama_barang", "satuan"] }]
            }
        ]
    });
    if (!nota) throw new ApiError(404, "Nota pembelian tidak ditemukan");
    return nota;
};

const create = async (data, id_user, filePath) => {
    let items = data.items;
    if (typeof items === "string") items = JSON.parse(items);

    if (!items || items.length === 0) {
        throw new ApiError(400, "Minimal harus ada 1 barang dalam nota");
    }

    const t = await sequelize.transaction();
    try {
        let totalHarga = 0;
        for (const item of items) {
            totalHarga += Number(item.jumlah) * Number(item.harga_satuan);
        }

        const nota = await NotaPembelian.create({
            nomor_nota: data.nomor_nota || null,
            tanggal: data.tanggal,
            id_supplier: data.id_supplier || null,
            id_user,
            keterangan: data.keterangan || null,
            file_nota: filePath,
            total_harga: totalHarga
        }, { transaction: t });

        for (const item of items) {
            const barang = await Barang.findByPk(item.id_barang, { transaction: t });
            if (!barang) throw new ApiError(404, `Barang dengan id ${item.id_barang} tidak ditemukan`);

            const subtotal = Number(item.jumlah) * Number(item.harga_satuan);

            await TransaksiMasuk.create({
                id_nota: nota.id_nota,
                id_barang: item.id_barang,
                jumlah: item.jumlah,
                harga_satuan: item.harga_satuan,
                subtotal
            }, { transaction: t });

            barang.stok_saat_ini += Number(item.jumlah);
            await barang.save({ transaction: t });
        }

        await t.commit();
        return await getById(nota.id_nota);
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const remove = async (id) => {
    const t = await sequelize.transaction();
    try {
        const nota = await NotaPembelian.findByPk(id, {
            include: [{ model: TransaksiMasuk, as: "rincian" }],
            transaction: t
        });
        if (!nota) throw new ApiError(404, "Nota pembelian tidak ditemukan");

        for (const item of nota.rincian) {
            const barang = await Barang.findByPk(item.id_barang, { transaction: t });
            if (barang) {
                barang.stok_saat_ini -= item.jumlah;
                await barang.save({ transaction: t });
            }
            await item.destroy({ transaction: t });
        }

        await nota.destroy({ transaction: t });
        await t.commit();
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const getExportData = async ({ tanggal_awal, tanggal_akhir, id_supplier }) => {
    const filter = { tanggal: { [Op.between]: [tanggal_awal, tanggal_akhir] } };
    if (id_supplier) filter.id_supplier = id_supplier;

    const notaList = await NotaPembelian.findAll({
        where: filter,
        order: [["tanggal", "ASC"]],
        include: [
            { model: Supplier, attributes: ["nama_supplier"] },
            { model: Pengguna, attributes: ["nama"] },
            {
                model: TransaksiMasuk,
                as: "rincian",
                include: [{ model: Barang, attributes: ["nama_barang", "satuan"] }]
            }
        ]
    });

    const rows = [];
    for (const nota of notaList) {
        for (const item of nota.rincian) {
            rows.push({
                tanggal: nota.tanggal,
                nomor_nota: nota.nomor_nota || "-",
                supplier: nota.Supplier?.nama_supplier || "-",
                nama_barang: item.Barang?.nama_barang || "-",
                jumlah: item.jumlah,
                satuan: item.Barang?.satuan || "-",
                harga_satuan: item.harga_satuan,
                subtotal: item.subtotal,
                dicatat_oleh: nota.Pengguna?.nama || "-"
            });
        }
    }
    return rows;
};

const getRekapBulanan = async ({ tanggal_awal, tanggal_akhir }) => {
    const filter = { tanggal: { [Op.between]: [tanggal_awal, tanggal_akhir] } };

    const notaList = await NotaPembelian.findAll({
        where: filter,
        include: [{ model: Supplier, attributes: ["nama_supplier"] }]
    });

    const totalKeseluruhan = notaList.reduce((sum, n) => sum + Number(n.total_harga), 0);
    const jumlahNota = notaList.length;

    const perSupplierMap = {};
    for (const nota of notaList) {
        const nama = nota.Supplier?.nama_supplier || "Tanpa supplier";
        perSupplierMap[nama] = (perSupplierMap[nama] || 0) + Number(nota.total_harga);
    }
    const perSupplier = Object.entries(perSupplierMap).map(([nama_supplier, total]) => ({ nama_supplier, total }));

    return { totalKeseluruhan, jumlahNota, perSupplier };
};

module.exports = { getAll, getById, create, remove, getExportData, getRekapBulanan };