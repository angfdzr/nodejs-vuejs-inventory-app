const { DataTypes } = require("sequelize");
const sequelize = require("../config/Db");

const NotaPembelian = sequelize.define("NotaPembelian", {
    id_nota: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nomor_nota: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tanggal: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    file_nota: {
        type: DataTypes.STRING,
        allowNull: true
    },
    total_harga: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
    },
    keterangan: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: "nota_pembelian"
});

module.exports = NotaPembelian;