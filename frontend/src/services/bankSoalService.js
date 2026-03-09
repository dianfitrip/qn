import api from "./api";

export const bankSoalService = {
  getAll: () => api.get("/admin/bank-soal"),
  getById: (id) => api.get(`/admin/bank-soal/${id}`),
  create: (data) => api.post("/admin/bank-soal", data),
  update: (id, data) => api.put(`/admin/bank-soal/${id}`, data),
  delete: (id) => api.delete(`/admin/bank-soal/${id}`),
};