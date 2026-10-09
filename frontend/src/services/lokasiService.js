import api from "./api";

export const getLokasi = (params) => api.get("/lokasi", { params });
export const getLokasiById = (id) => api.get(`/lokasi/${id}`);
export const createLokasi = (data) => api.post("/lokasi", data);
export const updateLokasi = (id, data) => api.put(`/lokasi/${id}`, data);
export const deleteLokasi = (id) => api.delete(`/lokasi/${id}`);