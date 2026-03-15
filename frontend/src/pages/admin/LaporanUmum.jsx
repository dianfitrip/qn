import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { 
  Search, Loader2, Download, Filter, 
  Calendar, FileText, BarChart2, CheckCircle, XCircle, Users
} from 'lucide-react';

const LaporanUmum = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Filter Waktu
  const currentYear = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState(""); // Kosong = Semua Tahun
  const [filterMonth, setFilterMonth] = useState(""); // Kosong = Semua Bulan

  // Daftar Bulan untuk Dropdown
  const months = [
    { value: "01", label: "Januari" }, { value: "02", label: "Februari" },
    { value: "03", label: "Maret" }, { value: "04", label: "April" },
    { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
    { value: "07", label: "Juli" }, { value: "08", label: "Agustus" },
    { value: "09", label: "September" }, { value: "10", label: "Oktober" },
    { value: "11", label: "November" }, { value: "12", label: "Desember" }
  ];

  // Menghasilkan daftar tahun (5 tahun ke belakang + 1 tahun ke depan)
  const years = Array.from({ length: 7 }, (_, i) => currentYear + 1 - i);

  // Load Data setiap kali filter bulan/tahun berubah
  useEffect(() => {
    fetchLaporan();
  }, [filterYear, filterMonth]);

  // Pencarian lokal di Frontend
  useEffect(() => {
    if (!dataList) return;
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = dataList.filter(item => {
      const skema = (item.nama_skema || item.judul_skema || '').toLowerCase();
      return skema.includes(lowerTerm);
    });
    setFilteredData(filtered);
  }, [searchTerm, dataList]);

  // --- FETCH DATA DARI API ---
  const fetchLaporan = async () => {
    setLoading(true);
    try {
      // Mengirimkan parameter tahun dan bulan ke backend (jika ada)
      const params = {};
      if (filterYear) params.tahun = filterYear;
      if (filterMonth) params.bulan = filterMonth;

      // Asumsi endpoint backend kamu adalah /admin/laporan/umum
      const res = await api.get('/admin/laporan/umum', { params });
      
      // Asumsi bentuk data dari backend: 
      // [{ nama_skema: '...', total_asesi: 10, kompeten: 8, belum_kompeten: 2 }]
      setDataList(res.data?.data || []); 
    } catch (error) {
      console.error(error);
      // Fallback data dummy jika endpoint backend belum dibuat
      // Hapus bagian data dummy ini jika backend sudah siap!
      const dummyData = [
        { id_skema: 1, nama_skema: "Pemrograman Web Tingkat Dasar", total_asesi: 45, kompeten: 40, belum_kompeten: 5 },
        { id_skema: 2, nama_skema: "Desain Grafis Madya", total_asesi: 30, kompeten: 25, belum_kompeten: 5 },
        { id_skema: 3, nama_skema: "Network Administrator Utama", total_asesi: 15, kompeten: 10, belum_kompeten: 5 },
      ];
      setDataList(dummyData);
      setFilteredData(dummyData);
      // Swal.fire("Error", "Gagal memuat data laporan", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI EXPORT KE CSV/EXCEL ---
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      return Swal.fire("Peringatan", "Tidak ada data untuk diekspor!", "warning");
    }

    // Membuat Header CSV
    let csvContent = "No,Skema Sertifikasi,Total Terdaftar,Kompeten,Belum Kompeten,Persentase Kelulusan\n";

    // Memasukkan Data ke CSV
    filteredData.forEach((item, index) => {
      const persentase = item.total_asesi > 0 
        ? ((item.kompeten / item.total_asesi) * 100).toFixed(1) 
        : 0;

      const row = [
        index + 1,
        `"${item.nama_skema || item.judul_skema || '-'}"`, // Pakai kutip agar spasi/koma aman
        item.total_asesi || 0,
        item.kompeten || 0,
        item.belum_kompeten || 0,
        `"${persentase}%"`
      ];
      csvContent += row.join(",") + "\n";
    });

    // Menambahkan Baris Total di akhir Excel
    const totalAsesi = filteredData.reduce((sum, item) => sum + (Number(item.total_asesi) || 0), 0);
    const totalK = filteredData.reduce((sum, item) => sum + (Number(item.kompeten) || 0), 0);
    const totalBK = filteredData.reduce((sum, item) => sum + (Number(item.belum_kompeten) || 0), 0);
    const avgPersentase = totalAsesi > 0 ? ((totalK / totalAsesi) * 100).toFixed(1) : 0;
    
    csvContent += `\n"TOTAL KESELURUHAN","",${totalAsesi},${totalK},${totalBK},"${avgPersentase}%"\n`;

    // Proses Download File
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    
    // Penamaan file dinamis berdasarkan filter
    const namaTahun = filterYear ? filterYear : "Semua_Tahun";
    const namaBulan = filterMonth ? months.find(m => m.value === filterMonth)?.label : "Semua_Bulan";
    link.setAttribute("download", `Laporan_LSP_${namaBulan}_${namaTahun}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- HITUNGAN TOTAL UNTUK FOOTER TABEL ---
  const sumAsesi = filteredData.reduce((acc, curr) => acc + (Number(curr.total_asesi) || 0), 0);
  const sumK = filteredData.reduce((acc, curr) => acc + (Number(curr.kompeten) || 0), 0);
  const sumBK = filteredData.reduce((acc, curr) => acc + (Number(curr.belum_kompeten) || 0), 0);
  const avgKelulusan = sumAsesi > 0 ? ((sumK / sumAsesi) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER PAGE */}
      <div>
        <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1 flex items-center gap-2">
          <BarChart2 className="text-[#CC6B27]" size={26}/>
          Laporan Umum Sertifikasi
        </h2>
        <p className="text-[14px] text-[#182D4A] m-0">Rekapitulasi jumlah asesi, tingkat kelulusan, dan status sertifikasi per Skema.</p>
      </div>

      {/* FILTER & TOOLBAR CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        
        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
          {/* SEARCH */}
          <div className="w-full md:w-64 relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              className="w-full pl-9 pr-4 py-2 border border-[#071E3D]/20 rounded-lg text-[13px] text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:border-[#CC6B27] focus:outline-none transition-all" 
              placeholder="Cari Nama Skema..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* FILTER TAHUN */}
          <div className="flex items-center gap-2 bg-[#FAFAFA] border border-[#071E3D]/20 px-3 py-2 rounded-lg">
            <Calendar size={16} className="text-[#CC6B27]" />
            <select 
              className="bg-transparent text-[13px] font-bold text-[#071E3D] focus:outline-none w-32"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="">Semua Tahun</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* FILTER BULAN */}
          <div className="flex items-center gap-2 bg-[#FAFAFA] border border-[#071E3D]/20 px-3 py-2 rounded-lg">
            <Filter size={16} className="text-[#CC6B27]" />
            <select 
              className="bg-transparent text-[13px] font-bold text-[#071E3D] focus:outline-none w-32"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="">Semua Bulan</option>
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>

        {/* EXPORT BUTTON */}
        <button 
          onClick={handleExportCSV}
          disabled={loading || filteredData.length === 0}
          className="w-full lg:w-auto px-5 py-2.5 rounded-lg font-bold bg-[#071E3D] text-white hover:bg-[#182D4A] shadow-sm flex items-center justify-center gap-2 text-[13px] transition-all disabled:opacity-50"
        >
          <Download size={16} className="text-[#CC6B27]" /> Export Data
        </button>

      </div>

      {/* TABLE CONTENT */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-[#071E3D] text-[#FAFAFA]">
                <th className="py-3.5 px-4 font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                <th className="py-3.5 px-4 font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Skema Sertifikasi</th>
                <th className="py-3.5 px-4 font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center"><div className="flex items-center justify-center gap-1.5"><Users size={14} className="text-[#CC6B27]"/> Total Terdaftar</div></th>
                <th className="py-3.5 px-4 font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center"><div className="flex items-center justify-center gap-1.5"><CheckCircle size={14} className="text-green-400"/> Kompeten</div></th>
                <th className="py-3.5 px-4 font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center"><div className="flex items-center justify-center gap-1.5"><XCircle size={14} className="text-red-400"/> Belum Kompeten</div></th>
                <th className="py-3.5 px-4 font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Persentase Lulus</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#CC6B27] mb-3" size={32} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Mengkalkulasi data laporan...</p>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, idx) => {
                  const persentase = item.total_asesi > 0 
                    ? ((item.kompeten / item.total_asesi) * 100).toFixed(1) 
                    : 0;

                  return (
                    <tr key={idx} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors text-[13px]">
                      <td className="py-4 px-4 text-center font-semibold text-[#071E3D]">{idx + 1}</td>
                      <td className="py-4 px-4 font-bold text-[#182D4A]">{item.nama_skema || item.judul_skema}</td>
                      <td className="py-4 px-4 text-center font-bold text-[#071E3D] bg-slate-50">{item.total_asesi || 0}</td>
                      <td className="py-4 px-4 text-center font-bold text-green-600">{item.kompeten || 0}</td>
                      <td className="py-4 px-4 text-center font-bold text-red-600">{item.belum_kompeten || 0}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full font-bold text-[11px] ${
                          persentase >= 75 ? 'bg-green-100 text-green-700 border border-green-200' :
                          persentase >= 50 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {persentase}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="text-[#071E3D]/20 mb-3"/>
                      <p className="text-[#182D4A] font-medium text-[14px]">Tidak ada data laporan pada periode ini.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {/* ROW TOTAL KESELURUHAN */}
            {!loading && filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-[#182D4A] text-white">
                  <td colSpan="2" className="py-4 px-4 text-right font-bold uppercase text-[12px] tracking-wider border-t-2 border-[#CC6B27]">Total Keseluruhan :</td>
                  <td className="py-4 px-4 text-center font-extrabold text-[14px] text-[#CC6B27] border-t-2 border-[#CC6B27]">{sumAsesi}</td>
                  <td className="py-4 px-4 text-center font-bold text-green-400 border-t-2 border-[#CC6B27]">{sumK}</td>
                  <td className="py-4 px-4 text-center font-bold text-red-400 border-t-2 border-[#CC6B27]">{sumBK}</td>
                  <td className="py-4 px-4 text-center font-bold text-white border-t-2 border-[#CC6B27]">{avgKelulusan}%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default LaporanUmum;