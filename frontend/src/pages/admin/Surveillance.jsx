import React, { useState, useEffect } from 'react';
import api from "../../services/api";
import Swal from 'sweetalert2';
import { 
  Search, Filter, Download, Eye, CheckCircle, 
  XCircle, Loader2, FileText, Building, MapPin, Briefcase 
} from 'lucide-react';

const Surveillance = () => {
  const [surveillances, setSurveillances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Filters sesuai controller backend
  const [filters, setFilters] = useState({
    search: '',
    status_verifikasi: '',
    sumber_dana: '',
    periode: ''
  });

  // State Modal Detail
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSurveillance();
  }, [filters.status_verifikasi, filters.sumber_dana, filters.periode]);

  const fetchSurveillance = async () => {
    try {
      setLoading(true);
      // Endpoint disesuaikan dengan admin.routes.js (asumsi: GET /admin/surveillance)
      const res = await api.get('/admin/surveillance', { params: filters });
      setSurveillances(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching surveillance:", error);
      Swal.fire('Gagal', 'Gagal memuat data surveillance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSurveillance();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Fungsi Export ke Excel
  const handleExport = async () => {
    try {
      // Memanggil endpoint export (pastikan di admin.routes.js routenya tersedia misal: GET /admin/surveillance/export)
      const res = await api.get('/admin/surveillance/export', { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Data_Surveillance_${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      Swal.fire('Gagal', 'Gagal mengekspor data ke Excel', 'error');
    }
  };

  // Fungsi Update Status (Terima / Tolak)
  const handleUpdateStatus = async (id, status) => {
    const confirmText = status === 'diterima' ? 'menerima' : 'menolak';
    const confirmColor = status === 'diterima' ? '#10B981' : '#EF4444';

    const confirm = await Swal.fire({
      title: `Konfirmasi Verifikasi`,
      text: `Apakah Anda yakin ingin ${confirmText} pengajuan surveillance ini?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonText: 'Batal',
      confirmButtonText: `Ya, ${confirmText}!`
    });

    if (confirm.isConfirmed) {
      try {
        // Asumsi endpoint update status: PUT /admin/surveillance/:id/status
        await api.put(`/admin/surveillance/${id}/status`, { status_verifikasi: status });
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: `Status berhasil diubah menjadi ${status}`,
          timer: 1500,
          showConfirmButton: false
        });
        
        setShowModal(false);
        fetchSurveillance();
      } catch (error) {
        Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan', 'error');
      }
    }
  };

  // Komponen Badge Status
  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'diterima': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Diterima</span>;
      case 'ditolak': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">Ditolak</span>;
      default: return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">Menunggu</span>;
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-[#071E3D] rounded-2xl shadow-lg p-6 mb-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-xl border border-white/20">
              <FileText className="text-[#CC6B27]" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black mb-1">Manajemen Surveillance</h1>
              <p className="text-[#FAFAFA]/70 text-sm">Kelola dan verifikasi laporan pemeliharaan sertifikasi (Surveillance) Asesi</p>
            </div>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="relative z-10 px-5 py-2.5 bg-[#CC6B27] hover:bg-[#a8561f] text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md text-sm"
        >
          <Download size={16} /> Export Excel
        </button>
      </div>

      {/* FILTER & PENCARIAN */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 flex flex-col lg:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input 
            type="text" 
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Cari Periode / Sumber Dana..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </form>

        <div className="flex gap-3">
          <div className="relative min-w-[150px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
            <select 
              name="status_verifikasi" 
              value={filters.status_verifikasi} 
              onChange={handleFilterChange}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none appearance-none font-medium text-slate-600"
            >
              <option value="">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="diterima">Diterima</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>

          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
            <select 
              name="sumber_dana" 
              value={filters.sumber_dana} 
              onChange={handleFilterChange}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none appearance-none font-medium text-slate-600"
            >
              <option value="">Semua Sumber Dana</option>
              <option value="apbn">APBN</option>
              <option value="apbd">APBD</option>
              <option value="perusahaan">Perusahaan</option>
              <option value="mandiri">Mandiri</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#CC6B27]" size={40} />
          </div>
        ) : surveillances.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            Tidak ada data surveillance yang ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="p-4 text-[13px] font-bold uppercase w-12 text-center">No</th>
                  <th className="p-4 text-[13px] font-bold uppercase">Asesi</th>
                  <th className="p-4 text-[13px] font-bold uppercase">Skema</th>
                  <th className="p-4 text-[13px] font-bold uppercase">Periode & Dana</th>
                  <th className="p-4 text-[13px] font-bold uppercase text-center">Status</th>
                  <th className="p-4 text-[13px] font-bold uppercase text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {surveillances.map((item, index) => (
                  <tr key={item.id_surveillance} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm text-center text-slate-500">{index + 1}</td>
                    <td className="p-4">
                      <div className="font-bold text-[#071E3D] text-sm">{item.User?.username || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{item.User?.email || '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-700 leading-snug line-clamp-2 max-w-xs">
                        {item.Skema?.judul_skema || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-slate-700">Tahun {item.periode_surveillance}</div>
                      <div className="text-xs text-slate-500 uppercase">{item.sumber_dana?.replace('_', ' ')}</div>
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={item.status_verifikasi} />
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => { setSelectedItem(item); setShowModal(true); }}
                        className="p-2 bg-[#071E3D]/5 hover:bg-[#071E3D]/10 text-[#071E3D] rounded-lg transition-colors inline-flex"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL SURVEILLANCE */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="bg-[#071E3D] p-5 flex justify-between items-center shrink-0">
              <h2 className="text-white font-bold text-lg">Detail Laporan Surveillance</h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            {/* Body Modal (Scrollable) */}
            <div className="p-6 overflow-y-auto bg-slate-50 space-y-6">
              
              {/* Info Asesi & Skema */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-bold uppercase">Nama Asesi</p>
                    <p className="font-bold text-[#071E3D]">{selectedItem.User?.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-bold uppercase">Status Saat Ini</p>
                    <StatusBadge status={selectedItem.status_verifikasi} />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-500 mb-1 font-bold uppercase">Skema Sertifikasi</p>
                    <p className="text-sm font-medium text-slate-800">{selectedItem.Skema?.judul_skema}</p>
                  </div>
                </div>
              </div>

              {/* Data Sertifikat & Dana */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
                  <p className="text-xs text-slate-500 font-bold uppercase">No. Sertifikat</p>
                  <p className="text-sm font-medium">{selectedItem.nomor_sertifikat || '-'}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-2">No. Registrasi</p>
                  <p className="text-sm font-medium">{selectedItem.nomor_registrasi || '-'}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
                  <p className="text-xs text-slate-500 font-bold uppercase">Periode Surveillance</p>
                  <p className="text-sm font-medium">Tahun ke-{selectedItem.periode_surveillance}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-2">Sumber Dana</p>
                  <p className="text-sm font-medium capitalize">{selectedItem.sumber_dana?.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Data Pekerjaan & Proyek */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-[#071E3D] border-b pb-2 flex items-center gap-2">
                  <Building size={18} className="text-[#CC6B27]" /> Data Pekerjaan / Proyek
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Nama Perusahaan</p>
                    <p className="text-sm font-medium">{selectedItem.nama_perusahaan || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Jabatan Pekerjaan</p>
                    <p className="text-sm font-medium">{selectedItem.jabatan_pekerjaan || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Alamat Perusahaan</p>
                    <p className="text-sm font-medium flex items-start gap-1">
                      <MapPin size={14} className="mt-0.5 text-slate-400 shrink-0"/> {selectedItem.alamat_perusahaan || '-'}
                    </p>
                  </div>
                  <hr className="md:col-span-2 border-slate-100 my-1" />
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Nama Proyek Terakhir</p>
                    <p className="text-sm font-medium">{selectedItem.nama_proyek || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Jabatan dalam Proyek</p>
                    <p className="text-sm font-medium">{selectedItem.jabatan_dalam_proyek || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Evaluasi & Bukti */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-[#071E3D] border-b pb-2 flex items-center gap-2">
                  <Briefcase size={18} className="text-[#CC6B27]" /> Evaluasi Kompetensi & Bukti
                </h3>
                
                <div>
                  <p className="text-xs text-slate-500 mb-1">Kesesuaian Kompetensi Saat Ini</p>
                  <p className="text-sm font-bold text-[#182D4A] capitalize">
                    {selectedItem.kesesuaian_kompetensi?.replace('_', ' ')}
                  </p>
                </div>

                {selectedItem.keterangan_lainnya && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Keterangan Lainnya</p>
                    <p className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                      {selectedItem.keterangan_lainnya}
                    </p>
                  </div>
                )}

                {/* Bagian file bukti (jika backend mengirimkan URL portofolio sebagai string JSON atau Array) */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">Bukti Portofolio / Logbook</p>
                  {selectedItem.bukti_portfolio ? (
                    <a 
                      href={`${api.defaults.baseURL.replace('/api', '')}/uploads/surveillance/${selectedItem.bukti_portfolio}`} 
                      target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium inline-flex items-center gap-2 hover:bg-blue-100 transition border border-blue-200"
                    >
                      <Download size={16} /> Unduh / Lihat Bukti
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Tidak ada bukti yang dilampirkan</p>
                  )}
                </div>
              </div>

            </div>

            {/* Footer Modal (Action Buttons) */}
            <div className="p-5 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
              {selectedItem.status_verifikasi === 'menunggu' ? (
                <>
                  <button 
                    onClick={() => handleUpdateStatus(selectedItem.id_surveillance, 'ditolak')}
                    className="px-6 py-2 rounded-xl font-bold bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-200 text-sm"
                  >
                    Tolak Pengajuan
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedItem.id_surveillance, 'diterima')}
                    className="px-6 py-2 rounded-xl font-bold bg-[#10B981] text-white hover:bg-[#059669] shadow-md transition text-sm flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> Terima Pengajuan
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-sm"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Surveillance;