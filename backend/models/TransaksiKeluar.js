const { DataTypes } = require("sequelize");
const sequelize = require("../config/Db");

const TransaksiKeluar = sequelize.define("TransaksiKeluar", {
    id_transaksi_keluar: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tanggal: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    keperluan: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: "transaksi_keluar"
});

module.exports = TransaksiKeluar;