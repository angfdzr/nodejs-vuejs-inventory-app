const { DataTypes } = require("sequelize");
const sequelize = require("../config/Db");

const Lokasi = sequelize.define("Lokasi", {
    id_lokasi: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_lokasi: {
        type: DataTypes.STRING,
        allowNull: false
    },
    keterangan: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: "lokasi"
});

module.exports = Lokasi;