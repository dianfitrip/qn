import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../services/api";
import { 
  Search, ArrowLeft, Loader2, User, Award, FileText, CheckCircle
} from 'lucide-react';

const PesertaJadwal = () => {
  const { id_jadwal } = useParams();
  const navigate = useNavigate();

  const [pesertaList, setPesertaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jadwalInfo, setJadwalInfo] = useState(null);

  useEffect(() => {
    fetchPeserta();
  }, [id_jadwal]);

  const fetchPeserta = async () => {
    try {
      setLoading(true);
      // Sesuaikan endpoint ini dengan rute backend Anda, misal: /admin/peserta-jadwal/:id_jadwal
      const res = await api.get(`/admin/peserta-jadwal/${id_jadwal}`);
      setPesertaList(res.data.data || []);
      
      // Ambil info jadwal dari data pertama jika ada
      if (res.data.data && res.data.data.length > 0) {
        setJadwalInfo(res.data.data[0].jadwal);
      }
    } catch (error) {
      console.error("Gagal mengambil data peserta:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = pesertaList.filter(item => 
    item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nomor_peserta?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate('/admin/jadwal/uji-kompetensi')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#182D4A]">Data Peserta Jadwal</h1>
          <p className="text-gray-500 text-sm">
            {jadwalInfo ? `Jadwal: ${jadwalInfo.nama_kegiatan} | Gel: ${jadwalInfo.gelombang}` : 'Mengelola asesi yang terdaftar di jadwal ini'}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan email atau nomor peserta..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#CC6B27] focus:ring-1 focus:ring-[#CC6B27] text-sm"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#071E3D] text-white text-[13px]">
                <th className="p-4 font-semibold w-12 text-center">No</th>
                <th className="p-4 font-semibold">Nomor Peserta</th>
                <th className="p-4 font-semibold">Email / ID User</th>
                <th className="p-4 font-semibold">Status Asesmen</th>
                <th className="p-4 font-semibold text-center">Nilai Akhir</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#CC6B27] mb-2" size={24} />
                    <p className="text-gray-500 text-sm">Memuat data peserta...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 text-sm">
                    Belum ada peserta yang terdaftar pada jadwal ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={row.id_peserta} className="border-b border-gray-50 hover:bg-gray-50 transition-colors text-[13px]">
                    <td className="p-4 text-center text-gray-600">{index + 1}</td>
                    <td className="p-4 font-medium text-[#182D4A]">{row.nomor_peserta || '-'}</td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        {row.user?.email || `User ID: ${row.id_user}`}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                        ${row.status_asesmen === 'kompeten' ? 'bg-green-100 text-green-700' : 
                          row.status_asesmen === 'belum_kompeten' ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {row.status_asesmen.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-[#182D4A]">
                      {row.nilai_akhir ? row.nilai_akhir : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PesertaJadwal;