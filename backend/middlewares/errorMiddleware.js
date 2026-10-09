const ApiError = require("../utils/ApiError");

const notFound = (req, res, next) => {
    next(new ApiError(404, `Route tidak ditemukan - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Terjadi kesalahan pada server"
    });
};

module.exports = { notFound, errorHandler };