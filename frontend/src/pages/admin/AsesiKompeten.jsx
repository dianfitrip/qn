import React, { useState, useEffect } from "react";
import { FaSearch, FaAward, FaEye, FaPrint } from "react-icons/fa";
import api from "../../services/api";

const AsesiKompeten = () => {
  const [asesiList, setAsesiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // States untuk Datatable Features
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Fungsi untuk ganti halaman
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset ke halaman 1 jika user mengetik di search bar atau mengubah jumlah entries
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  return (
    <div className="p-6">
      {/* Header Halaman */}
      <h1 className="text-2xl font-bold text-[#182D4A] mb-2 flex items-center gap-2">
        <FaAward className="text-[#CC6B27]" /> Data Asesi Kompeten
      </h1>
      <p className="text-gray-600 mb-6">
        Daftar asesi yang telah lulus uji kompetensi dan direkomendasikan kompeten.
      </p>

      {/* Kontainer Utama Tabel */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        
        {/* Top Controls: Show Entries & Search */}
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
                placeholder="Cari data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
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
                  <tr key={item.id_peserta} className="hover:bg-gray-50 text-sm border-b border-gray-100 transition-colors">
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
                        <button 
                          className="flex items-center gap-1 bg-[#182D4A] text-white px-2.5 py-1.5 rounded shadow-sm hover:bg-[#0a1424] transition-colors text-xs"
                          title="Lihat Detail"
                        >
                          <FaEye /> Detail
                        </button>
                        <button 
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

        {/* Bottom Controls: Info & Pagination */}
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
            
            {/* Generate Page Numbers */}
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
    </div>
  );
};

export default AsesiKompeten;