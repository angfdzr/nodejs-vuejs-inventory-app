import api from "./api";

export const getNotaPembelian = (params) => api.get("/nota-pembelian", { params });
export const getNotaPembelianById = (id) => api.get(`/nota-pembelian/${id}`);
export const createNotaPembelian = (formData) => api.post("/nota-pembelian", formData);
export const deleteNotaPembelian = (id) => api.delete(`/nota-pembelian/${id}`);
export const getRekapBulanan = (params) => api.get("/nota-pembelian/rekap-bulanan", { params });
export const exportNotaPembelian = (params) =>
    api.get("/nota-pembelian/export", { params, responseType: "blob" });