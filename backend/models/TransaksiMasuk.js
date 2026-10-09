const { DataTypes } = require("sequelize");
const sequelize = require("../config/Db");

const TransaksiMasuk = sequelize.define("TransaksiMasuk", {
    id_transaksi_masuk: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    harga_satuan: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
    },
    subtotal: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: "transaksi_masuk"
});

module.exports = TransaksiMasuk;