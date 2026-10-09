const sequelize = require("../config/Db");
const Pengguna = require("./Pengguna");
const Kategori = require("./Kategori");
const Lokasi = require("./Lokasi");
const Supplier = require("./Supplier");
const Barang = require("./Barang");
const NotaPembelian = require("./NotaPembelian");
const TransaksiMasuk = require("./TransaksiMasuk");
const TransaksiKeluar = require("./TransaksiKeluar");

Kategori.hasMany(Barang, { foreignKey: "id_kategori" });
Barang.belongsTo(Kategori, { foreignKey: "id_kategori" });

// Nota Pembelian -> Supplier & Pengguna (pencatat)
Supplier.hasMany(NotaPembelian, { foreignKey: "id_supplier" });
NotaPembelian.belongsTo(Supplier, { foreignKey: "id_supplier" });

Pengguna.hasMany(NotaPembelian, { foreignKey: "id_user" });
NotaPembelian.belongsTo(Pengguna, { foreignKey: "id_user" });

// Nota Pembelian -> Transaksi Masuk (1 nota, banyak rincian barang)
NotaPembelian.hasMany(TransaksiMasuk, { foreignKey: "id_nota", as: "rincian" });
TransaksiMasuk.belongsTo(NotaPembelian, { foreignKey: "id_nota" });

Barang.hasMany(TransaksiMasuk, { foreignKey: "id_barang" });
TransaksiMasuk.belongsTo(Barang, { foreignKey: "id_barang" });

Barang.hasMany(TransaksiKeluar, { foreignKey: "id_barang" });
TransaksiKeluar.belongsTo(Barang, { foreignKey: "id_barang" });

Pengguna.hasMany(TransaksiKeluar, { foreignKey: "id_user" });
TransaksiKeluar.belongsTo(Pengguna, { foreignKey: "id_user" });

Lokasi.hasMany(TransaksiKeluar, { foreignKey: "id_lokasi" });
TransaksiKeluar.belongsTo(Lokasi, { foreignKey: "id_lokasi" });

module.exports = {
    sequelize,
    Pengguna,
    Kategori,
    Lokasi,
    Supplier,
    Barang,
    NotaPembelian,
    TransaksiMasuk,
    TransaksiKeluar
};