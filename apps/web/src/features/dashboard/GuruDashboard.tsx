import React, { useEffect, useState } from 'react';
import api from '../../lib/api-client';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { MapPin } from 'lucide-react';

export const GuruDashboard: React.FC = () => {
  const [presensiList, setPresensiList] = useState<any[]>([]);

  useEffect(() => {
    api.get('/presensi').then((res) => setPresensiList(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Dashboard Guru Pembimbing</h1>
        <p className="text-xs text-slate-500 mt-1">Pantau presensi dan progres siswa bimbingan PKL Anda.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-heading font-bold text-slate-900 text-base">Presensi Siswa Bimbingan Hari Ini</h3>
          <span className="text-xs text-slate-400">Total: {presensiList.length} Siswa</span>
        </div>

        {presensiList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Belum ada siswa bimbingan yang presensi hari ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Lokasi DUDI</th>
                  <th className="py-3 px-4">Jam Masuk</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Foto Selfie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {presensiList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.muridNama}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 text-slate-400 mr-1" />
                        {item.dudiNama}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {new Date(item.jamMasuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
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
                          Lihat Foto
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
