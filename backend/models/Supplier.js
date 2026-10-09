const { DataTypes } = require("sequelize");
const sequelize = require("../config/Db");

const Supplier = sequelize.define("Supplier", {
    id_supplier: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_supplier: {
        type: DataTypes.STRING,
        allowNull: false
    },
    kontak: {
        type: DataTypes.STRING,
        allowNull: true
    },
    alamat: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: "supplier"
});

module.exports = Supplier;