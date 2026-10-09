const { DataTypes } = require("sequelize");
const sequelize = require("../config/Db");

const Kategori = sequelize.define("Kategori", {
    id_kategori: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_kategori: {
        type: DataTypes.STRING,
        allowNull: false
    },
    keterangan: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: "kategori"
});

module.exports = Kategori;