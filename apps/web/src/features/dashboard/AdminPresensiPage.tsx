import React, { useEffect, useState } from 'react';
import api from '../../lib/api-client';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Calendar, Users, MapPin, Download } from 'lucide-react';

export const AdminPresensiPage: React.FC = () => {
  const [presensiList, setPresensiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<string>(
    new Date().toISOString().substring(0, 10),
  );

  const fetchPresensi = async () => {
    setLoading(true);
    try {
      const res = await api.get('/presensi', { params: { tanggal: filterDate } });
      setPresensiList(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresensi();
  }, [filterDate]);

  const handleExport = async () => {
    try {
      const res = await api.get('/laporan/presensi/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `rekap_presensi_${new Date().toISOString().substring(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunduh laporan.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Rekap Presensi</h1>
        <p className="text-xs text-slate-500 mt-1">Pantau kehadiran seluruh siswa PKL berdasarkan tanggal.</p>
      </div>

      {/* Filter & Export Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Excel</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-heading font-bold text-slate-900 text-base flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Daftar Presensi</span>
          </h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full font-medium">
            {presensiList.length} siswa hadir
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Memuat data...</div>
        ) : presensiList.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            Belum ada data presensi pada tanggal{' '}
            {new Date(filterDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Guru Pembimbing</th>
                  <th className="py-3 px-4">Lokasi DUDI</th>
                  <th className="py-3 px-4">Jam Masuk</th>
                  <th className="py-3 px-4">Jam Pulang</th>
                  <th className="py-3 px-4">Status Masuk</th>
                  <th className="py-3 px-4">Foto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {presensiList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.muridNama}</td>
                    <td className="py-3 px-4 text-slate-600">{item.guruNama}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 text-slate-400 mr-1" />
                        {item.dudiNama}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {item.jamMasuk
                        ? new Date(item.jamMasuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {item.jamPulang
                        ? new Date(item.jamPulang).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.statusMasuk || 'tepat_waktu'} />
                    </td>
                    <td className="py-3 px-4">
                      {item.fotoMasuk ? (
                        <a
                          href={item.fotoMasuk}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-medium hover:underline"
                        >
                          Lihat
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
