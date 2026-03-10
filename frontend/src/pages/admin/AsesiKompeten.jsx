import React, { useState, useEffect } from "react";
import { FaSearch, FaAward } from "react-icons/fa";

const AsesiKompeten = () => {
  const [asesiList, setAsesiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Nanti diisi dengan fetch ke backend (misal: /api/admin/asesi/kompeten)
  useEffect(() => {
    // Simulasi data
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#182D4A] mb-2 flex items-center gap-2">
        <FaAward className="text-[#CC6B27]" /> Data Asesi Kompeten
      </h1>
      <p className="text-gray-600 mb-6">Daftar asesi yang telah lulus uji kompetensi dan direkomendasikan kompeten.</p>

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
              <th className="p-3 border-b">Skema</th>
              <th className="p-3 border-b">Nilai Akhir</th>
              <th className="p-3 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b">1</td>
              <td className="p-3 border-b">3401123456780001</td>
              <td className="p-3 border-b font-medium text-[#182D4A]">Budi Santoso</td>
              <td className="p-3 border-b">Web Developer</td>
              <td className="p-3 border-b font-bold text-green-600">95.00</td>
              <td className="p-3 border-b">
                <button className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Cetak Sertifikat</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AsesiKompeten;