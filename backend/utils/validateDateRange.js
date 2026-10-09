const ApiError = require("./ApiError");

const validateDateRange = (tanggal_awal, tanggal_akhir) => {
    if (!tanggal_awal || !tanggal_akhir) {
        throw new ApiError(400, "Tanggal awal dan tanggal akhir wajib diisi untuk unduh laporan");
    }
    if (new Date(tanggal_awal) > new Date(tanggal_akhir)) {
        throw new ApiError(400, "Tanggal awal tidak boleh lebih besar dari tanggal akhir");
    }
};

module.exports = validateDateRange;