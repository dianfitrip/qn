import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { ArrowLeft, Settings, Plus, Trash2, X, Loader2, CheckSquare, Square, List } from 'lucide-react';

const METODE_OPTIONS = [
  { id: "IA01", name: "IA01 - Observasi Langsung" },
  { id: "IA02", name: "IA02 - Tugas Praktik Demonstrasi" },
  { id: "IA03", name: "IA03 - Pertanyaan Lisan" },
  { id: "IA04A", name: "IA04A - Pertanyaan Tertulis (PG)" },
  { id: "IA04B", name: "IA04B - Pertanyaan Tertulis (Esai)" },
  { id: "IA05", name: "IA05 - Pertanyaan Wawancara" },
  { id: "IA06", name: "IA06 - Wawancara Berbasis Portofolio" },
  { id: "IA07", name: "IA07 - Wawancara Berbasis Jurnal" },
  { id: "IA09", name: "IA09 - Cek Portofolio" }
];

const Mapa02 = () => {
  const { id } = useParams(); // id_mapa
  const navigate = useNavigate();

  // --- STATE UTAMA ---
  const [loading, setLoading] = useState(true);
  const [masterData, setMasterData] = useState(null);
  const [mappings, setMappings] = useState([]);
  
  // State untuk form Tambah Mapping
  const [units, setUnits] = useState([]);
  const [kelompoks, setKelompoks] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedKelompok, setSelectedKelompok] = useState("");

  // State untuk modal Metode
  const [showMetodeModal, setShowMetodeModal] = useState(false);
  const [activeMapping, setActiveMapping] = useState(null);
  const [currentMetodeList, setCurrentMetodeList] = useState([]);
  const [loadingMetode, setLoadingMetode] = useState(false);

  useEffect(() => {
    fetchDetail();
    fetchMasterData();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const masterRes = await api.get(`/admin/mapa/${id}`);
      setMasterData(masterRes.data?.data || masterRes.data);

      const res = await api.get(`/admin/mapa02/mapping/${id}`);
      setMappings(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Error fetching MAPA-02 Details:", error);
      Swal.fire('Error', 'Gagal memuat data MAPA-02', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const unitRes = await api.get('/admin/unit-kompetensi');
      setUnits(unitRes.data?.data || unitRes.data || []);

      const kelRes = await api.get('/admin/kelompok-pekerjaan');
      setKelompoks(kelRes.data?.data || kelRes.data || []);
    } catch (error) {
      console.error("Gagal mengambil master data Unit/Kelompok", error);
    }
  };

  const handleAddMapping = async () => {
    if (!selectedUnit || !selectedKelompok) {
      return Swal.fire('Peringatan', 'Silakan pilih Unit Kompetensi & Kelompok Pekerjaan terlebih dahulu.', 'warning');
    }

    try {
      setLoading(true);
      const payload = {
        id_mapa: parseInt(id),
        id_unit: parseInt(selectedUnit),
        id_kelompok: parseInt(selectedKelompok)
      };

      await api.post('/admin/mapa02/mapping', payload);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil', 
        text: 'Mapping Unit & Kelompok berhasil ditambahkan',
        timer: 1500,
        showConfirmButton: false
      });
      
      setSelectedUnit("");
      setSelectedKelompok("");
      fetchDetail();
    } catch (error) {
      Swal.fire('Gagal', error.response?.data?.message || 'Gagal menambah mapping', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMapping = async (id_mapping) => {
    const confirm = await Swal.fire({
      title: 'Hapus Mapping?',
      text: "Data beserta metode asesmennya akan terhapus!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!'
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`/admin/mapa02/mapping/${id_mapping}`);
        Swal.fire({
          icon: 'success', 
          title: 'Terhapus', 
          text: 'Mapping berhasil dihapus',
          timer: 1500,
          showConfirmButton: false
        });
        fetchDetail();
      } catch (error) {
        Swal.fire('Error', 'Gagal menghapus mapping', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // --- HANDLER MODAL METODE ---
  const openMetodeModal = async (mapping) => {
    setActiveMapping(mapping);
    setLoadingMetode(true);
    setShowMetodeModal(true);
    try {
      const res = await api.get(`/admin/mapa02/metode/${mapping.id_mapping}`);
      setCurrentMetodeList(res.data?.data || res.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Gagal mengambil pengaturan metode', 'error');
      setShowMetodeModal(false);
    } finally {
      setLoadingMetode(false);
    }
  };

  const toggleMetode = async (metode_id) => {
    const isExist = currentMetodeList.find(m => m.metode === metode_id);
    
    try {
      if (isExist) {
        // Hapus metode jika di-uncheck
        await api.delete(`/admin/mapa02/metode/${isExist.id_metode}`);
        setCurrentMetodeList(prev => prev.filter(m => m.id_metode !== isExist.id_metode));
      } else {
        // Tambah metode jika di-check
        const res = await api.post('/admin/mapa02/metode', {
          id_mapping: activeMapping.id_mapping,
          metode: metode_id,
          digunakan: true
        });
        const newData = res.data?.data || res.data;
        setCurrentMetodeList(prev => [...prev, newData]);
      }
    } catch (error) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat mengubah metode', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-[#CC6B27]" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-[#071E3D] rounded-2xl shadow-lg p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <button 
            onClick={() => navigate('/admin/mapa')}
            className="flex items-center gap-2 text-[#FAFAFA]/70 hover:text-white mb-4 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Kembali ke Data MAPA
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white/10 p-3 rounded-xl border border-white/20">
              <Settings className="text-[#CC6B27]" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black mb-1">Peta Instrumen Asesmen (MAPA-02)</h1>
              <p className="text-[#FAFAFA]/70 text-sm">
                Skema: {masterData?.skema?.nama_skema || masterData?.skema?.judul_skema || "Memuat..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL KIRI: TAMBAH MAPPING */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-[#071E3D] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Plus size={20} className="text-[#CC6B27]" /> Tambah Mapping Baru
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#182D4A] mb-1.5">Unit Kompetensi</label>
                <select 
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 outline-none transition-all"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  <option value="">-- Pilih Unit Kompetensi --</option>
                  {units.map(u => (
                    <option key={u.id_unit} value={u.id_unit}>{u.kode_unit} - {u.judul_unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#182D4A] mb-1.5">Kelompok Pekerjaan</label>
                <select 
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 outline-none transition-all"
                  value={selectedKelompok}
                  onChange={(e) => setSelectedKelompok(e.target.value)}
                >
                  <option value="">-- Pilih Kelompok Pekerjaan --</option>
                  {kelompoks.map(k => (
                    <option key={k.id_kelompok} value={k.id_kelompok}>{k.nama_kelompok}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleAddMapping}
                className="w-full py-2.5 bg-[#071E3D] hover:bg-[#182D4A] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all mt-2"
              >
                <Plus size={16} /> Tambahkan Mapping
              </button>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: LIST MAPPING */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-[#071E3D] flex items-center gap-2">
                <List size={20} className="text-[#CC6B27]" /> Data Mapping & Metode Asesmen
              </h2>
            </div>
            
            {mappings.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                Belum ada data mapping Unit Kompetensi dan Kelompok Pekerjaan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase w-12 text-center">No</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Unit Kompetensi</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Kelompok Pekerjaan</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center w-36">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mappings.map((map, index) => {
                      // Mengatasi perbedaan alias response relasi Sequelize (bisa lowercase/uppercase)
                      const unit = map.UnitKompetensi || map.unit_kompetensi || {};
                      const kelompok = map.KelompokPekerjaan || map.kelompok_pekerjaan || {};

                      return (
                        <tr key={map.id_mapping} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-sm text-center text-slate-500">{index + 1}</td>
                          <td className="p-4">
                            <div className="text-xs font-bold text-[#CC6B27] mb-1">{unit.kode_unit || '-'}</div>
                            <div className="text-sm font-medium text-[#071E3D] leading-tight">{unit.judul_unit || 'Memuat unit...'}</div>
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-600">
                            {kelompok.nama_kelompok || <span className="text-slate-400 italic">Belum diatur</span>}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => openMetodeModal(map)}
                                className="px-3 py-1.5 bg-[#071E3D]/5 hover:bg-[#071E3D]/10 text-[#071E3D] rounded-lg text-[12px] font-bold flex items-center justify-center gap-2 transition-colors border border-[#071E3D]/10"
                              >
                                <Settings size={14} /> Atur Metode
                              </button>
                              <button 
                                onClick={() => handleDeleteMapping(map.id_mapping)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[12px] font-bold flex items-center justify-center gap-2 transition-colors border border-red-100"
                              >
                                <Trash2 size={14} /> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL ATUR METODE */}
      {showMetodeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#071E3D] p-5 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-white font-bold text-lg">Atur Metode Asesmen</h2>
                <p className="text-white/60 text-xs mt-0.5">
                  {activeMapping?.UnitKompetensi?.judul_unit || activeMapping?.unit_kompetensi?.judul_unit || "Memuat Unit..."}
                </p>
              </div>
              <button onClick={() => setShowMetodeModal(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50">
              <div className="mb-5 text-sm text-blue-800 bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm flex items-start gap-3">
                <div className="mt-0.5"><Settings size={18} /></div>
                <p>Tandai / Centang metode asesmen (<b>IA01 - IA09</b>) yang akan digunakan pada Unit Kompetensi dan Kelompok Pekerjaan ini.</p>
              </div>

              {loadingMetode ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="animate-spin text-[#CC6B27]" size={32} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {METODE_OPTIONS.map((opt) => {
                    const isActive = currentMetodeList.some(m => m.metode === opt.id);
                    return (
                      <div 
                        key={opt.id} 
                        onClick={() => toggleMetode(opt.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all select-none
                          ${isActive 
                            ? 'border-[#CC6B27] bg-[#CC6B27]/5 shadow-sm' 
                            : 'border-slate-200 bg-white hover:border-[#CC6B27]/50 hover:bg-[#FAFAFA]'}`}
                      >
                        <div className={`${isActive ? 'text-[#CC6B27]' : 'text-[#182D4A]/30'}`}>
                          {isActive ? <CheckSquare size={24} /> : <Square size={24} />}
                        </div>
                        <span className={`font-bold text-[13px] ${isActive ? 'text-[#071E3D]' : 'text-[#182D4A]'}`}>
                          {opt.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-200 bg-white flex justify-end shrink-0">
              <button 
                type="button" 
                onClick={() => setShowMetodeModal(false)} 
                className="px-8 py-2.5 rounded-xl font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-md transition-all text-sm"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mapa02;