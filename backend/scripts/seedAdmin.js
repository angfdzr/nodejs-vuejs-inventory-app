require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, Pengguna } = require("../models");

(async () => {
    try {
        await sequelize.sync();

        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        const nama = process.env.ADMIN_NAMA;

        if (!email || !password) {
            console.error("ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi");
            process.exit(1);
        }

        const existing = await Pengguna.findOne({ where: { email } });
        if (existing) {
            console.log("User dengan email tersebut sudah ada, tidak ada yang diubah.");
            process.exit(0);
        }

        await Pengguna.create({
            nama,
            email,
            password: await bcrypt.hash(password, 10),
            role: "admin"
        });

        console.log(`Admin berhasil dibuat: ${email}`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();