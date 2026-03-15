import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaTimes, FaSave, FaFileAlt, FaSpinner } from "react-icons/fa";

const Skkni = () => {
  // --- STATE ---
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State Modal Form (Create/Edit)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // State Modal Detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // State Preview Dokumen
  const [showFullPdf, setShowFullPdf] = useState(false);

  // State Form Data (Sesuai Model Backend)
  const [formData, setFormData] = useState({
    jenis_standar: "SKKNI",
    no_skkni: "",
    judul_skkni: "",
    legalitas: "",
    sektor: "",
    sub_sektor: "",
    penerbit: "",
  });

  // State khusus file upload
  const [dokumenFile, setDokumenFile] = useState(null);

  // Load Data
  useEffect(() => {
    fetchData();
  }, []);

  // Filter Search
  useEffect(() => {
    if (!dataList) return;
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = dataList.filter(item => {
      const no = item.no_skkni?.toLowerCase() || '';
      const judul = item.judul_skkni?.toLowerCase() || '';
      return no.includes(lowerTerm) || judul.includes(lowerTerm);
    });
    setFilteredData(filtered);
  }, [searchTerm, dataList]);

  // --- API FUNCTIONS ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/skkni");
      setDataList(response.data?.data || []);
      setFilteredData(response.data?.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memuat data SKKNI", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setDokumenFile(e.target.files[0]);
    setShowFullPdf(false); // Reset preview view saat file baru dipilih
  };

  const openModal = () => {
    setShowModal(true);
    setIsEditing(false);
    setEditId(null);
    setDokumenFile(null);
    setShowFullPdf(false);
    setFormData({
      jenis_standar: "SKKNI",
      no_skkni: "",
      judul_skkni: "",
      legalitas: "",
      sektor: "",
      sub_sektor: "",
      penerbit: "",
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setShowFullPdf(false);
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
    setShowFullPdf(false);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
    setShowFullPdf(false);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item.id_skkni);
    setDokumenFile(null);
    setShowFullPdf(false);
    setFormData({
      jenis_standar: item.jenis_standar || "SKKNI",
      no_skkni: item.no_skkni || "",
      judul_skkni: item.judul_skkni || "",
      legalitas: item.legalitas || "",
      sektor: item.sektor || "",
      sub_sektor: item.sub_sektor || "",
      penerbit: item.penerbit || "",
    });
    setShowModal(true);
  };

  // ==========================================
  // --- BLOK FUNGSI VALIDASI ---
  // ==========================================
  const validateForm = () => {
    const fieldsToCheck = [
      { key: 'no_skkni', name: 'Nomor SKKNI' },
      { key: 'judul_skkni', name: 'Judul SKKNI' },
      { key: 'legalitas', name: 'Legalitas' },
      { key: 'sektor', name: 'Sektor' },
      { key: 'sub_sektor', name: 'Sub Sektor' },
      { key: 'penerbit', name: 'Penerbit' },
    ];

    for (let field of fieldsToCheck) {
      const value = String(formData[field.key] || "").trim();
      if (value.length > 0 && value.length < 4) {
        return `Inputan pada kolom "${field.name}" terlalu pendek ("${value}"). Minimal harus 4 karakter!`;
      }
    }
    return null;
  };

  // ==========================================
  // --- BLOK FUNGSI SIMPAN & KONFIRMASI ---
  // ==========================================
  const handleSave = async (e) => {
    e.preventDefault();

    // 1. Validasi Input
    const errorMsg = validateForm();
    if (errorMsg) {
      return Swal.fire("Validasi Gagal", errorMsg, "warning");
    }

    // 2. Konfirmasi SweetAlert
    const confirmResult = await Swal.fire({
      title: "Konfirmasi Simpan",
      text: `Yakin ingin ${isEditing ? 'menyimpan perubahan' : 'menambahkan'} data SKKNI ini? Pastikan file dan data sudah benar.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27", 
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal"
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);
    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        dataToSend.append(key, formData[key]);
      });
      if (dokumenFile) {
        dataToSend.append("dokumen_skkni", dokumenFile);
      }

      if (isEditing) {
        await api.put(`/admin/skkni/${editId}`, dataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({ title: "Berhasil", text: "Data SKKNI diperbarui", icon: "success", timer: 1500 });
      } else {
        await api.post("/admin/skkni", dataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({ title: "Berhasil", text: "Data SKKNI ditambahkan", icon: "success", timer: 1500 });
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // --- BLOK FUNGSI HAPUS & KONFIRMASI ---
  // ==========================================
  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Yakin ingin menghapus data SKKNI ini? Data yang terkait mungkin akan ikut terpengaruh!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus Data!",
      cancelButtonText: "Batal"
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await api.delete(`/admin/skkni/${id}`);
      Swal.fire({ title: "Terhapus!", text: "Data berhasil dihapus.", icon: "success", timer: 1500 });
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal menghapus data", "error");
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER */}
      <div>
        <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1 flex items-center gap-2">
          <FaFileAlt className="text-[#CC6B27]" size={22}/>
          Data Standar / SKKNI
        </h2>
        <p className="text-[14px] text-[#182D4A] m-0">Kelola master data SKKNI dan dokumen pendukung.</p>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="w-full md:w-80 relative group">
            <FaSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" 
              placeholder="Cari No atau Judul SKKNI..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={openModal} 
            className="w-full md:w-auto px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center justify-center gap-2 text-[13px] transition-all"
          >
            <FaPlus size={14} /> Tambah SKKNI
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Nomor SKKNI</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Judul SKKNI</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Dokumen</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <FaSpinner className="animate-spin mx-auto text-[#CC6B27] mb-3" size={30} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id_skkni} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors text-[13px]">
                    <td className="py-4 px-4 text-center font-semibold text-[#071E3D]">{index + 1}</td>
                    <td className="py-4 px-4 font-bold text-[#CC6B27] whitespace-nowrap">{item.no_skkni}</td>
                    <td className="py-4 px-4 font-medium text-[#182D4A]">{item.judul_skkni}</td>
                    <td className="py-4 px-4 text-center">
                      {item.dokumen ? (
                        <a href={`http://localhost:3000/uploads/${item.dokumen}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#182D4A]/10 text-[#182D4A] hover:bg-[#CC6B27] hover:text-white transition-all text-[11px] font-bold">
                          <FaFileAlt size={12}/> Lihat File
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-[12px]">Tidak Ada</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openDetailModal(item)} className="p-2 rounded-lg text-[#071E3D] bg-slate-100 hover:bg-[#071E3D] hover:text-white transition-all shadow-sm" title="Lihat Detail">
                          <FaEye size={14} />
                        </button>
                        <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-[#CC6B27] bg-[#CC6B27]/10 hover:bg-[#CC6B27] hover:text-white transition-all shadow-sm" title="Edit Data">
                          <FaEdit size={14} />
                        </button>
                        <button onClick={() => handleDelete(item.id_skkni)} className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 hover:border-transparent" title="Hapus Data">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FaFileAlt size={48} className="text-[#071E3D]/20 mb-3"/>
                      <p className="text-[#182D4A] font-medium text-[14px]">Belum ada data SKKNI tersedia.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM CREATE/EDIT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-[#071E3D]/10 bg-[#FAFAFA] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 text-[#182D4A]">
                {isEditing ? <FaEdit size={18} className="text-[#CC6B27]" /> : <FaPlus size={18} className="text-[#CC6B27]" />}
                <h3 className="font-bold text-[16px]">{isEditing ? "Edit Data SKKNI" : "Tambah SKKNI Baru"}</h3>
              </div>
              <button onClick={closeModal} className="text-[#182D4A]/50 hover:text-red-500 p-1 rounded-lg transition-colors">
                <FaTimes size={18}/>
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="skkniForm" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="md:col-span-2">
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Judul SKKNI</label>
                  <input required type="text" name="judul_skkni" value={formData.judul_skkni} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]" placeholder="Masukkan Judul SKKNI"/>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Nomor SKKNI</label>
                  <input required type="text" name="no_skkni" value={formData.no_skkni} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]" placeholder="Contoh: KEP/123/2023"/>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Jenis Standar</label>
                  <select name="jenis_standar" value={formData.jenis_standar} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]">
                    <option value="SKKNI">SKKNI</option>
                    <option value="Standar Internasional">Standar Internasional</option>
                    <option value="Standar Khusus">Standar Khusus</option>
                  </select>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Sektor</label>
                  <input type="text" name="sektor" value={formData.sektor} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"/>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Sub Sektor</label>
                  <input type="text" name="sub_sektor" value={formData.sub_sektor} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"/>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Legalitas</label>
                  <input type="text" name="legalitas" value={formData.legalitas} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"/>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Penerbit</label>
                  <input type="text" name="penerbit" value={formData.penerbit} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"/>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Upload Dokumen Pendukung (PDF)</label>
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="w-full p-2 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-white focus:outline-none text-[13px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[12px] file:font-semibold file:bg-[#CC6B27]/10 file:text-[#CC6B27] hover:file:bg-[#CC6B27]/20 transition-all"/>
                </div>

                {/* BLOK PREVIEW FILE BARU (HANYA MUNCUL JIKA ADA FILE DIPILIH) */}
                {dokumenFile && (
                  <div className="mt-4 md:col-span-2">
                    <label className="text-[13px] font-bold text-[#071E3D] mb-2 block">Preview Dokumen yang Akan Diunggah:</label>
                    <div className={`relative border border-[#071E3D]/20 rounded-lg bg-gray-50 ${!showFullPdf ? 'max-h-[400px] overflow-hidden' : ''}`}>
                      <iframe 
                        src={URL.createObjectURL(dokumenFile) + "#toolbar=0"} 
                        className="w-full h-[800px] rounded-lg" 
                        title="Preview PDF"
                      />
                      {!showFullPdf && (
                        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-4">
                          <button 
                            type="button" 
                            onClick={() => setShowFullPdf(true)} 
                            className="bg-[#CC6B27] text-white px-5 py-2.5 rounded-full font-bold shadow-lg hover:bg-[#a8561f] hover:-translate-y-1 transition-all text-[13px] z-10"
                          >
                            📄 Tampilkan Dokumen Selengkapnya
                          </button>
                        </div>
                      )}
                    </div>
                    {showFullPdf && (
                      <div className="flex justify-end mt-2">
                        <button type="button" onClick={() => setShowFullPdf(false)} className="text-[#CC6B27] text-[12px] font-bold hover:underline">
                          Sembunyikan Sebagian ⮝
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </form>
            </div>

            <div className="p-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 shrink-0">
              <button type="button" onClick={closeModal} className="px-5 py-2 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]">Batal</button>
              <button type="submit" form="skkniForm" disabled={loading} className="px-5 py-2 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-[13px] disabled:opacity-70 transition-colors">
                {loading ? <FaSpinner className="animate-spin" /> : <FaSave />} 
                {isEditing ? "Simpan Perubahan" : "Simpan Data"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA] shrink-0">
              <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center m-0">
                <FaFileAlt className="mr-2 text-[#CC6B27]"/> Detail Data SKKNI
              </h3>
              <button onClick={closeDetailModal} className="text-[#182D4A] hover:text-red-500 p-1.5 rounded-lg transition-colors">
                <FaTimes size={18}/>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="bg-[#FAFAFA] p-5 rounded-lg border border-[#071E3D]/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Judul SKKNI</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.judul_skkni}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Nomor SKKNI</label>
                    <p className="font-bold text-[#CC6B27] mt-0.5 m-0 bg-[#CC6B27]/10 w-fit px-2 py-0.5 rounded">{selectedItem.no_skkni}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Jenis Standar</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.jenis_standar}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Legalitas</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.legalitas || "-"}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Sektor / Sub Sektor</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.sektor || "-"} / {selectedItem.sub_sektor || "-"}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Penerbit</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.penerbit || "-"}</p>
                  </div>
                </div>

                {/* BLOK PREVIEW DOKUMEN DI MODAL DETAIL */}
                <div className="md:col-span-2 mt-6 pt-4 border-t border-[#071E3D]/10">
                  <label className="text-[13px] font-bold text-[#071E3D] mb-2 block flex items-center gap-2">
                    <FaFileAlt className="text-[#CC6B27]" /> Isi Dokumen Lampiran
                  </label>
                  
                  {selectedItem.dokumen ? (
                    <div className={`relative mt-2 border border-[#071E3D]/20 rounded-lg bg-gray-50 shadow-inner ${!showFullPdf ? 'max-h-[500px] overflow-hidden' : ''}`}>
                      <iframe 
                        src={`http://localhost:3000/uploads/${selectedItem.dokumen}#toolbar=0`} 
                        className="w-full h-[800px] rounded-lg" 
                        title="Detail PDF"
                      />
                      {!showFullPdf && (
                        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/90 to-transparent flex items-end justify-center pb-5">
                          <button 
                            type="button" 
                            onClick={() => setShowFullPdf(true)} 
                            className="bg-[#071E3D] text-white px-6 py-2.5 rounded-full font-bold shadow-xl border-2 border-white hover:bg-[#182D4A] hover:scale-105 transition-all text-[13px] z-10"
                          >
                            Buka Dokumen Penuh
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[#182D4A]/50 italic text-[13px] mt-1">Tidak ada dokumen yang diunggah.</p>
                  )}

                  {selectedItem.dokumen && showFullPdf && (
                    <div className="flex justify-end mt-2">
                      <button type="button" onClick={() => setShowFullPdf(false)} className="text-[#182D4A] text-[12px] font-bold hover:text-[#CC6B27] transition-colors">
                        Perkecil Tampilan ⮝
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end shrink-0">
                <button onClick={closeDetailModal} className="px-6 py-2 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]">
                  Tutup
                </button>
            </div>

          </div>
        </div>
      )}

      {/* Style CSS untuk Scrollbar Modal */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8561f; }
      `}} />

    </div>
  );
};

export default Skkni;