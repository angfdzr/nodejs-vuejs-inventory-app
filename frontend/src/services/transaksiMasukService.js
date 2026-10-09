import api from "./api";

export const getTransaksiMasuk = (params) => api.get("/transaksi-masuk", { params });
export const createTransaksiMasuk = (data) => api.post("/transaksi-masuk", data);
export const exportTransaksiMasuk = (params) =>
    api.get("/transaksi-masuk/export", { params, responseType: "blob" });