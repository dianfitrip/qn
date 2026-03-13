import React, { useState, useEffect } from "react";
import { FaSearch, FaTimesCircle } from "react-icons/fa";
import api from "../../services/api";

const AsesiBelumKompeten = () => {
  const [asesiList, setAsesiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAsesiBelumKompeten = async () => {
    try {
      setLoading(true);
      // Memanggil endpoint global dengan filter 'belum_kompeten'
      const res = await api.get('/admin/peserta-jadwal/global?status=belum_kompeten');
      setAsesiList(res.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsesiBelumKompeten();
  }, []);

  const filteredData = asesiList.filter((item) => {
    const nik = item.user?.ProfileAsesi?.nik || item.user?.profileAsesi?.nik || "";
    const nama = item.user?.nama_lengkap || item.user?.ProfileAsesi?.nama_lengkap || item.user?.email || "";
    return (
      nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#182D4A] mb-2 flex items-center gap-2">
        <FaTimesCircle className="text-red-600" /> Data Asesi Belum Tersertifikasi
      </h1>
      <p className="text-gray-600 mb-6">
        Daftar asesi yang telah mengikuti uji kompetensi namun direkomendasikan belum kompeten.
      </p>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center">
        <div className="relative flex-1 w-full max-w-md">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari NIK atau Nama Asesi..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#071E3D] text-[#FAFAFA]">
              <th className="p-3 border-b text-center w-12">No</th>
              <th className="p-3 border-b">NIK</th>
              <th className="p-3 border-b">Nama Lengkap</th>
              <th className="p-3 border-b">Skema</th>
              <th className="p-3 border-b">Nilai Akhir</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">Memuat data...</td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">Belum ada data asesi dengan status belum kompeten.</td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id_peserta} className="hover:bg-gray-50">
                  <td className="p-3 border-b text-center">{index + 1}</td>
                  <td className="p-3 border-b">{item.user?.ProfileAsesi?.nik || item.user?.profileAsesi?.nik || "-"}</td>
                  <td className="p-3 border-b font-medium text-[#182D4A]">
                    {item.user?.nama_lengkap || item.user?.ProfileAsesi?.nama_lengkap || item.user?.email || "-"}
                  </td>
                  <td className="p-3 border-b">{item.jadwal?.skema?.nama_skema || "-"}</td>
                  <td className="p-3 border-b font-bold text-red-600">
                    {item.nilai_akhir || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AsesiBelumKompeten;