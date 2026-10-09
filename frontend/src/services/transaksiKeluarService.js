import api from "./api";

export const getTransaksiKeluar = (params) => api.get("/transaksi-keluar", { params });
export const createTransaksiKeluar = (data) => api.post("/transaksi-keluar", data);
export const exportTransaksiKeluar = (params) =>
    api.get("/transaksi-keluar/export", { params, responseType: "blob" });