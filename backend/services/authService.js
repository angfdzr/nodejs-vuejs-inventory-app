const bcrypt = require("bcryptjs");
const { Pengguna } = require("../models");
const ApiError = require("../utils/ApiError");

const register = async ({ nama, email, password, role }) => {
    const existing = await Pengguna.findOne({ where: { email } });
    if (existing) throw new ApiError(400, "Email sudah terdaftar");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Pengguna.create({
        nama,
        email,
        password: hashedPassword,
        role: role || "staff"
    });

    return { id_user: user.id_user, nama: user.nama, email: user.email, role: user.role };
};

const login = async ({ email, password }) => {
    const user = await Pengguna.findOne({ where: { email } });
    if (!user) throw new ApiError(401, "Email atau password salah");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(401, "Email atau password salah");

    return { id_user: user.id_user, nama: user.nama, email: user.email, role: user.role };
};

module.exports = { register, login };