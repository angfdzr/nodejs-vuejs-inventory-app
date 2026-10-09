const dotenv = require("dotenv");
const { Sequelize } = require("sequelize");

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "mysql",

        logging: false,

        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },

        define: {
            timestamps: true
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Koneksi ke database berhasil.");
    } catch (error) {
        console.error("Koneksi ke database gagal:", error.message);
        process.exit(1);
    }
};

connectDB();

module.exports = sequelize;