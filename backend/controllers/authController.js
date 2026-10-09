const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");

const register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, message: "Registrasi berhasil", data: user });
});

const login = asyncHandler(async (req, res) => {
    const user = await authService.login(req.body);
    req.session.user = user;
    res.status(200).json({ success: true, message: "Login berhasil", data: user });
});

const logout = asyncHandler(async (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ success: false, message: "Gagal logout" });
        res.clearCookie("connect.sid");
        res.status(200).json({ success: true, message: "Logout berhasil" });
    });
});

const me = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: req.session.user });
});

module.exports = { register, login, logout, me };