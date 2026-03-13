import React, { useState, useEffect } from "react";
import { FaSearch, FaAward, FaEye, FaPrint, FaTimes, FaUserCheck } from "react-icons/fa";
import api from "../../services/api";

const AsesiKompeten = () => {
  const [asesiList, setAsesiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // States untuk Datatable Features
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // State untuk Modal Detail
  const [selectedDetail, setSelectedDetail] = useState(null);

  const fetchAsesiKompeten = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/peserta-jadwal/global?status=kompeten');
      setAsesiList(res.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsesiKompeten();
  }, []);

  // 1. Logika Filter (Search)
  const filteredData = asesiList.filter((item) => {
    const nik = item.user?.ProfileAsesi?.nik || item.user?.profileAsesi?.nik || "";
    const nama = item.user?.nama_lengkap || item.user?.ProfileAsesi?.nama_lengkap || item.user?.email || "";
    const skema = item.jadwal?.skema?.nama_skema || "";
    
    return (
      nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skema.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // 2. Logika Pagination
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  // ==========================================
  // FUNGSI HANDLER UNTUK TOMBOL DETAIL (KIRIM ITEM LANGSUNG)
  // ==========================================
  const handleDetail = (item) => {
    setSelectedDetail(item); // Langsung set data dari baris yang diklik
  };

  const closeModal = () => {
    setSelectedDetail(null);
  };

  // ==========================================
  // FUNGSI HANDLER UNTUK TOMBOL CETAK (KIRIM ITEM LANGSUNG)
  // ==========================================
  const handleCetak = (asesi) => {
    if (!asesi) return;

    // Ekstrak data secara dinamis dari objek asesi yang diklik
    const nama = asesi.user?.nama_lengkap || asesi.user?.ProfileAsesi?.nama_lengkap || asesi.user?.profileAsesi?.nama_lengkap || asesi.user?.email || "NAMA TIDAK DITEMUKAN";
    const nik = asesi.user?.ProfileAsesi?.nik || asesi.user?.profileAsesi?.nik || "-";
    const skema = asesi.jadwal?.skema?.nama_skema || "SKEMA TIDAK DITEMUKAN";
    const kodeSkema = asesi.jadwal?.skema?.kode_skema || asesi.jadwal?.skema?.no_skema || "-";
    const tanggal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    // Membuka window baru untuk Print PDF
    const printWindow = window.open('', '_blank', 'width=1000,height=700');
    
    // Inject HTML & CSS Sertifikat ke window baru
    printWindow.document.write(`
      <html>
        <head>
          <title>Sertifikat - ${nama}</title>
          <style>
            @page { size: A4 landscape; margin: 0; }
            body { 
              font-family: 'Times New Roman', serif; 
              text-align: center; 
              margin: 0;
              padding: 40px; 
              background-color: #fff; 
              -webkit-print-color-adjust: exact;
            }
            .certificate-container { 
              border: 15px solid #182D4A; 
              padding: 40px; 
              position: relative;
              height: 90%;
              box-sizing: border-box;
            }
            .inner-border {
              border: 2px solid #CC6B27;
              padding: 40px;
              height: 100%;
              box-sizing: border-box;
            }
            .logo-text { font-size: 24px; font-weight: bold; color: #182D4A; margin-bottom: 30px; letter-spacing: 2px;}
            h1 { color: #CC6B27; font-size: 45px; margin: 10px 0; letter-spacing: 5px; }
            h2 { color: #333; font-size: 20px; font-weight: normal; margin-bottom: 40px; }
            .name { 
              font-size: 40px; 
              font-weight: bold; 
              color: #000; 
              margin: 20px auto; 
              border-bottom: 2px solid #000; 
              display: inline-block; 
              padding: 0 40px 10px 40px;
              font-family: 'Arial', sans-serif;
              text-transform: uppercase;
            }
            .nik { font-size: 18px; color: #555; margin-bottom: 30px; letter-spacing: 1px;}
            .skema-text { font-size: 18px; line-height: 1.6; margin-bottom: 10px; }
            .skema-title { font-size: 26px; font-weight: bold; color: #182D4A; margin-bottom: 5px; text-transform: uppercase;}
            .skema-kode { font-size: 16px; color: #666; margin-bottom: 40px; }
            
            .footer { 
              position: absolute;
              bottom: 40px;
              left: 50px;
              right: 50px;
              display: flex; 
              justify-content: space-between; 
            }
            .signature-box { text-align: center; width: 300px; }
            .date { margin-bottom: 70px; font-size: 18px;}
            .signature-line { border-top: 1px solid #000; width: 100%; padding-top: 5px; font-weight: bold; font-size: 18px;}
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="inner-border">
              <div class="logo-text">LEMBAGA SERTIFIKASI PROFESI</div>
              <h1>SERTIFIKAT KOMPETENSI</h1>
              <h2>Dengan ini menyatakan bahwa:</h2>
              
              <div class="name">${nama}</div>
              <div class="nik">Nomor Induk Kependudukan (NIK): ${nik}</div>
              
              <div class="skema-text">
                Telah mengikuti Uji Kompetensi dan dinyatakan <strong>KOMPETEN</strong><br/>
                pada Skema Sertifikasi:
              </div>
              <div class="skema-title">"${skema}"</div>
              <div class="skema-kode">Kode Skema: ${kodeSkema}</div>
              
              <div class="footer">
                <div class="signature-box">
                  <div class="date">&nbsp;</div>
                  <div class="signature-line">Manajer Sertifikasi</div>
                </div>
                <div class="signature-box">
                  <div class="date">Ditetapkan di Jakarta, ${tanggal}</div>
                  <div class="signature-line">Ketua LSP</div>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { 
              setTimeout(() => {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold text-[#182D4A] mb-2 flex items-center gap-2">
        <FaAward className="text-[#CC6B27]" /> Data Asesi Kompeten
      </h1>
      <p className="text-gray-600 mb-6">
        Daftar asesi yang telah lulus uji kompetensi dan direkomendasikan kompeten.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <span>Show</span>
            <select
              className="mx-2 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#CC6B27] focus:ring-1 focus:ring-[#CC6B27]"
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center text-sm">
            <span className="mr-2 text-gray-600 font-medium">Search:</span>
            <div className="relative">
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" size={12} />
              <input
                type="text"
                className="border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#CC6B27] focus:ring-1 focus:ring-[#CC6B27]"
                placeholder="Cari NIK / Nama / Skema..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-t-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#071E3D] text-[#FAFAFA] text-sm">
                <th className="p-3 border-b text-center w-12 font-semibold">No</th>
                <th className="p-3 border-b font-semibold">NIK</th>
                <th className="p-3 border-b font-semibold">Nama Lengkap</th>
                <th className="p-3 border-b font-semibold">Nama Kegiatan / Jadwal</th>
                <th className="p-3 border-b font-semibold">Skema</th>
                <th className="p-3 border-b font-semibold text-center">Nilai</th>
                <th className="p-3 border-b font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-gray-500">
                    Tidak ada entri yang cocok.
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item.id_peserta || index} className="hover:bg-gray-50 text-sm border-b border-gray-100 transition-colors">
                    <td className="p-3 text-center text-gray-600">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="p-3 text-gray-700">
                      {item.user?.ProfileAsesi?.nik || item.user?.profileAsesi?.nik || "-"}
                    </td>
                    <td className="p-3 font-medium text-[#182D4A]">
                      {item.user?.nama_lengkap || item.user?.ProfileAsesi?.nama_lengkap || item.user?.email || "-"}
                    </td>
                    <td className="p-3 text-gray-600 text-xs">
                      {item.jadwal?.nama_kegiatan || "-"}
                    </td>
                    <td className="p-3 text-gray-600 text-xs">
                      {item.jadwal?.skema?.nama_skema || "-"}
                    </td>
                    <td className="p-3 text-center font-bold text-green-600">
                      {item.nilai_akhir || "-"}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        {/* Mengirimkan 'item' secara utuh */}
                        <button 
                          onClick={() => handleDetail(item)}
                          className="flex items-center gap-1 bg-[#182D4A] text-white px-2.5 py-1.5 rounded shadow-sm hover:bg-[#0a1424] transition-colors text-xs"
                          title="Lihat Detail"
                        >
                          <FaEye /> Detail
                        </button>
                        <button 
                          onClick={() => handleCetak(item)}
                          className="flex items-center gap-1 bg-[#CC6B27] text-white px-2.5 py-1.5 rounded shadow-sm hover:bg-[#b0581e] transition-colors text-xs"
                          title="Cetak Sertifikat"
                        >
                          <FaPrint /> Cetak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-sm">
          <div className="text-gray-600 mb-4 md:mb-0">
            Menampilkan {totalEntries === 0 ? 0 : indexOfFirstItem + 1} sampai{" "}
            {Math.min(indexOfLastItem, totalEntries)} dari {totalEntries} entri
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border rounded-md transition-colors ${
                currentPage === 1 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-white text-[#182D4A] hover:bg-gray-50 border-gray-300"
              }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1.5 border rounded-md transition-colors ${
                  currentPage === i + 1
                    ? "bg-[#CC6B27] text-white border-[#CC6B27]"
                    : "bg-white text-[#182D4A] hover:bg-gray-50 border-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1.5 border rounded-md transition-colors ${
                currentPage === totalPages || totalPages === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-white text-[#182D4A] hover:bg-gray-50 border-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL POP-UP DETAIL ASESI LENGKAP */}
      {/* ========================================== */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-[#071E3D] text-white p-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FaUserCheck className="text-[#CC6B27]" /> Detail Kelulusan Asesi
              </h2>
              <button onClick={closeModal} className="text-gray-300 hover:text-white transition-colors">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body - Data Lengkap */}
            <div className="p-6">
              {/* Seksi Data Diri */}
              <h3 className="font-bold text-[#182D4A] border-b-2 border-gray-100 pb-2 mb-4">Informasi Asesi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6">
                <div>
                  <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">NIK</label>
                  <p className="font-semibold text-gray-800">
                    {selectedDetail.user?.ProfileAsesi?.nik || selectedDetail.user?.profileAsesi?.nik || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Nama Lengkap</label>
                  <p className="font-semibold text-gray-800">
                    {selectedDetail.user?.nama_lengkap || selectedDetail.user?.ProfileAsesi?.nama_lengkap || selectedDetail.user?.profileAsesi?.nama_lengkap || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Email</label>
                  <p className="font-medium text-gray-800">
                    {selectedDetail.user?.email || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">No. Handphone / WA</label>
                  <p className="font-medium text-gray-800">
                    {selectedDetail.user?.ProfileAsesi?.no_hp || selectedDetail.user?.profileAsesi?.no_hp || selectedDetail.user?.no_hp || "-"}
                  </p>
                </div>
              </div>

              {/* Seksi Data Jadwal & Skema */}
              <h3 className="font-bold text-[#182D4A] border-b-2 border-gray-100 pb-2 mb-4">Detail Asesmen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div className="md:col-span-2">
                  <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Nama Kegiatan / Jadwal</label>
                  <p className="font-semibold text-gray-800">
                    {selectedDetail.jadwal?.nama_kegiatan || "-"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Skema Sertifikasi</label>
                  <p className="font-semibold text-[#CC6B27]">
                    {selectedDetail.jadwal?.skema?.kode_skema || selectedDetail.jadwal?.skema?.no_skema ? `[${selectedDetail.jadwal?.skema?.kode_skema || selectedDetail.jadwal?.skema?.no_skema}] ` : ""}
                    {selectedDetail.jadwal?.skema?.nama_skema || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Tempat Uji Kompetensi (TUK)</label>
                  <p className="font-medium text-gray-800">
                    {selectedDetail.jadwal?.tuk?.nama_tuk || selectedDetail.jadwal?.tuk?.nama || "TUK Sewaktu / Belum Diatur"}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Nilai Akhir</label>
                  <p className="font-bold text-green-600 text-lg">
                    {selectedDetail.nilai_akhir || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Status Rekomendasi</label>
                  <div className="mt-1">
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-xs border border-green-200 shadow-sm">
                      K - KOMPETEN
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Keterangan / Catatan</label>
                  <p className="font-medium text-gray-800 italic">
                    {selectedDetail.keterangan || selectedDetail.catatan || "Tidak ada catatan."}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Tutup
              </button>
              {/* Print dari modal juga mengirim data objek aslinya */}
              <button 
                onClick={() => handleCetak(selectedDetail)}
                className="px-5 py-2 bg-[#CC6B27] text-white rounded shadow-md hover:bg-[#b0581e] transition-colors text-sm font-bold flex items-center gap-2"
              >
                <FaPrint /> Cetak Sertifikat PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsesiKompeten;