import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  ArrowLeft, Save, Loader2, FileText, 
  CheckCircle, BookOpen, Layers, MapPin, Target 
} from 'lucide-react';

const Mapa01 = () => {
  const { id } = useParams(); // Ambil id_mapa dari URL parameter
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [masterData, setMasterData] = useState(null);

  // State Form sesuai dengan ENUM dan Model di database (mapa01.model.js)
  const [formData, setFormData] = useState({
    profil_asesi: '',
    tujuan_asesmen: 'sertifikasi',
    lingkungan: 'tempat_kerja_nyata',
    peluang_bukti: 'tersedia',
    pelaksana: 'lsp'
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Ambil data Master MAPA (untuk menampilkan info Skema di Header)
      const masterRes = await api.get(`/admin/mapa/${id}`);
      setMasterData(masterRes.data?.data || masterRes.data);

      // 2. Ambil isi form MAPA-01 (Jika sebelumnya sudah pernah di-save/update)
      // Endpoint sesuai di admin.routes.js: router.get("/mapa01/:id_mapa", ...)
      const res = await api.get(`/admin/mapa01/${id}`);
      const m01Data = res.data?.data || res.data;
      
      // Jika data ditemukan, set ke form
      if (m01Data && Object.keys(m01Data).length > 0) {
        setFormData({
          profil_asesi: m01Data.profil_asesi || '',
          tujuan_asesmen: m01Data.tujuan_asesmen || 'sertifikasi',
          lingkungan: m01Data.lingkungan || 'tempat_kerja_nyata',
          peluang_bukti: m01Data.peluang_bukti || 'tersedia',
          pelaksana: m01Data.pelaksana || 'lsp'
        });
      }
    } catch (error) {
      console.error("Error fetching MAPA01:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Sesuai dengan mapa01.controller.js yang menerima id_mapa di dalam req.body
      const payload = {
        ...formData,
        id_mapa: parseInt(id)
      };

      // Endpoint POST akan melakukan Create atau Update berdasarkan id_mapa
      await api.post('/admin/mapa01', payload);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan',
        text: 'Dokumen FR.MAPA.01 berhasil diperbarui!',
        timer: 1500,
        showConfirmButton: false
      });
      
      // Opsi: kembali ke halaman list MAPA setelah sukses
      // navigate('/admin/mapa'); 
      
    } catch (error) {
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Helper Class
  const inputClass = "w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[13px] text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium";
  const labelClass = "block text-[13px] font-bold text-[#071E3D] mb-1.5 flex items-center gap-1.5";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#FAFAFA]">
        <Loader2 className="animate-spin text-[#CC6B27]" size={40} />
        <p className="text-[#182D4A] mt-3 font-medium text-[14px]">Memuat Dokumen MAPA-01...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div className="flex items-start md:items-center gap-4">
          <button 
            onClick={() => navigate('/admin/mapa')} 
            className="p-2 bg-[#FAFAFA] text-[#182D4A] rounded-lg border border-[#071E3D]/10 hover:bg-[#E2E8F0] transition-colors mt-1 md:mt-0"
            title="Kembali ke Daftar MAPA"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#071E3D] text-white text-[10px] font-bold rounded uppercase tracking-wider">
                FR.MAPA.01
              </span>
              <span className="text-[11px] font-bold text-[#CC6B27] border border-[#CC6B27]/30 px-2 py-0.5 rounded bg-[#CC6B27]/5">
                Versi: {masterData?.versi || '-'}
              </span>
            </div>
            <h2 className="text-[20px] font-bold text-[#071E3D] m-0 leading-tight">
              Merencanakan Aktivitas dan Proses Asesmen
            </h2>
          </div>
        </div>
      </div>

      {/* 2. INFO SKEMA CARD */}
      <div className="bg-[#071E3D]/5 border border-[#071E3D]/10 rounded-xl p-5">
        <h4 className="text-[14px] font-bold text-[#071E3D] flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-[#CC6B27]"/> Informasi Skema Sertifikasi
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] font-bold text-[#182D4A]/70 uppercase tracking-wider block mb-0.5">Judul Skema</span>
            <p className="text-[14px] font-bold text-[#071E3D]">{masterData?.skema?.judul_skema || 'Memuat...'}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#182D4A]/70 uppercase tracking-wider block mb-0.5">Kode Skema</span>
            <p className="text-[13px] font-mono font-bold text-[#CC6B27]">{masterData?.skema?.kode_skema || 'Memuat...'}</p>
          </div>
        </div>
      </div>

      {/* 3. FORM PENGISIAN MAPA-01 */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm flex flex-col flex-1">
        
        <div className="px-6 py-4 border-b border-[#071E3D]/10 bg-[#FAFAFA] rounded-t-xl">
          <h3 className="text-[16px] font-bold text-[#071E3D] flex items-center gap-2 m-0">
            <FileText size={18} className="text-[#CC6B27]"/> Form Pengisian MAPA.01
          </h3>
        </div>

        <div className="p-6 flex flex-col gap-6">
          
          {/* PENDEKATAN ASESMEN (Tujuan & Profil) */}
          <div>
            <h4 className="text-[14px] font-bold text-[#CC6B27] mb-4 border-b border-[#CC6B27]/20 pb-2">1. Pendekatan Asesmen</h4>
            
            <div className="flex flex-col gap-5">
              <div>
                <label className={labelClass}><Target size={14}/> Tujuan Asesmen</label>
                <select name="tujuan_asesmen" value={formData.tujuan_asesmen} onChange={handleChange} className={inputClass}>
                  <option value="sertifikasi">Sertifikasi</option>
                  <option value="sertifikasi_ulang">Sertifikasi Ulang (RCC)</option>
                  <option value="pkt">Pengakuan Kompetensi Terkini (PKT)</option>
                  <option value="rpl">Rekognisi Pembelajaran Lampau (RPL)</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              
              <div>
                <label className={labelClass}><User size={14}/> Konteks Asesi / Profil Asesi</label>
                <textarea 
                  name="profil_asesi" 
                  value={formData.profil_asesi} 
                  onChange={handleChange} 
                  rows="3" 
                  className={`${inputClass} resize-none`}
                  placeholder="Deskripsikan karakteristik asesi (contoh: Siswa SMK kelas XII jurusan RPL yang telah menyelesaikan praktek kerja lapangan...)"
                ></textarea>
                <small className="text-[11px] text-[#182D4A]/70 mt-1 block">Karakteristik peserta didik, latar belakang, dan kebutuhan khusus (jika ada).</small>
              </div>
            </div>
          </div>

          {/* RENCANA ASESMEN (Lingkungan, Peluang, Pelaksana) */}
          <div className="mt-2">
            <h4 className="text-[14px] font-bold text-[#CC6B27] mb-4 border-b border-[#CC6B27]/20 pb-2">2. Rencana Asesmen</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}><MapPin size={14}/> Lingkungan Asesmen</label>
                <select name="lingkungan" value={formData.lingkungan} onChange={handleChange} className={inputClass}>
                  <option value="tempat_kerja_nyata">Tempat Kerja Nyata</option>
                  <option value="tempat_kerja_simulasi">Tempat Kerja Simulasi (TUK)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}><Layers size={14}/> Peluang Pengumpulan Bukti</label>
                <select name="peluang_bukti" value={formData.peluang_bukti} onChange={handleChange} className={inputClass}>
                  <option value="tersedia">Tersedia (Sangat memadai)</option>
                  <option value="terbatas">Terbatas</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}><CheckCircle size={14}/> Pihak Pelaksana Asesmen</label>
                <select name="pelaksana" value={formData.pelaksana} onChange={handleChange} className={inputClass}>
                  <option value="lsp">Lembaga Sertifikasi Profesi (LSP)</option>
                  <option value="organisasi_pelatihan">Organisasi Pelatihan (LKP/Sekolah)</option>
                  <option value="asesor_perusahaan">Asesor Perusahaan Internal</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER FORM (TOMBOL SAVE) */}
        <div className="bg-[#FAFAFA] p-5 border-t border-[#071E3D]/10 flex justify-end gap-3 mt-auto rounded-b-xl">
          <button 
            type="button" 
            onClick={() => navigate('/admin/mapa')} 
            className="px-6 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] hover:bg-[#E2E8F0] transition-colors text-[13px]"
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className="px-6 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
            Simpan Dokumen MAPA-01
          </button>
        </div>
        
      </form>
    </div>
  );
};

export default Mapa01;