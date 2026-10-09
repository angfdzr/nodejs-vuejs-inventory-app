const { DataTypes } = require("sequelize");
const sequelize = require("../config/Db");

const Pengguna = sequelize.define("Pengguna", {
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("admin", "staff"),
        allowNull: false,
        defaultValue: "staff"
    }
}, {
    tableName: "pengguna"
});

module.exports = Pengguna;