const { DataTypes } = require("sequelize");
const sequelize = require("../config/Db");

const Barang = sequelize.define("Barang", {
    id_barang: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_barang: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jenis_barang: {
        type: DataTypes.ENUM("habis_pakai", "tidak_habis_pakai"),
        allowNull: false
    },
    satuan: {
        type: DataTypes.STRING,
        allowNull: false
    },
    stok_minimum: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    stok_saat_ini: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: "barang"
});

module.exports = Barang;