import React, { useState, useEffect } from "react";
import { FaSearch, FaCalendarAlt } from "react-icons/fa";

const AsesiTerjadwal = () => {
  const [asesiList, setAsesiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Nanti diisi dengan fetch ke backend (misal: /api/admin/asesi/terjadwal)
  useEffect(() => {
    // Simulasi data
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#182D4A] mb-2 flex items-center gap-2">
        <FaCalendarAlt className="text-[#CC6B27]" /> Data Asesi Terjadwal
      </h1>
      <p className="text-gray-600 mb-6">Daftar asesi yang sudah memiliki jadwal ujian namun belum selesai dinilai.</p>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center">
        <div className="relative flex-1 w-full max-w-md">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari NIK atau Nama Asesi..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#CC6B27]"
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
              <th className="p-3 border-b">No</th>
              <th className="p-3 border-b">NIK</th>
              <th className="p-3 border-b">Nama Lengkap</th>
              <th className="p-3 border-b">Nama Kegiatan (Jadwal)</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b">1</td>
              <td className="p-3 border-b">3201000000000001</td>
              <td className="p-3 border-b font-medium text-[#182D4A]">Asesi Satu</td>
              <td className="p-3 border-b">Asesmen Web Developer - Gelombang 1</td>
              <td className="p-3 border-b">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  Pra Asesmen
                </span>
              </td>
              <td className="p-3 border-b">
                <button className="text-sm bg-[#CC6B27] text-white px-3 py-1 rounded hover:bg-orange-700">Proses</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AsesiTerjadwal;