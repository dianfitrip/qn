import api from "./api";

export const bankSoalPGService = {
  getBySoal: (id_soal) => api.get(`/admin/bank-soal-pg/${id_soal}`),
  create: (data) => api.post("/admin/bank-soal-pg", data),
  update: (id, data) => api.put(`/admin/bank-soal-pg/${id}`, data),
  delete: (id) => api.delete(`/admin/bank-soal-pg/${id}`),
};