import api from './api';

export const unitKompetensiService = {
  getAll: async () => {
    const response = await api.get('/admin/unit-kompetensi');
    return response.data;
  },
  // tambahkan fungsi lain jika dibutuhkan
};