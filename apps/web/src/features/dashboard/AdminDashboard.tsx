import React, { useEffect, useState } from 'react';
import api from '../../lib/api-client';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Users, Building, CheckCircle2, MapPin } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [presensiList, setPresensiList] = useState<any[]>([]);
  const [dudiList, setDudiList] = useState<any[]>([]);
  const [muridList, setMuridList] = useState<any[]>([]);

  useEffect(() => {
    api.get('/presensi').then((res) => setPresensiList(res.data)).catch(() => {});
    api.get('/master-data/dudi').then((res) => setDudiList(res.data)).catch(() => {});
    api.get('/master-data/murid').then((res) => setMuridList(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Dashboard Monitoring Admin</h1>
        <p className="text-xs text-slate-500 mt-1">Ringkasan real-time aktivitas presensi dan data penempatan PKL.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Murid PKL</p>
            <p className="font-heading text-2xl font-bold text-slate-900">{muridList.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Mitra DUDI Terdaftar</p>
            <p className="font-heading text-2xl font-bold text-slate-900">{dudiList.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Presensi Hari Ini</p>
            <p className="font-heading text-2xl font-bold text-slate-900">{presensiList.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-heading font-bold text-slate-900 text-base">Rekap Presensi Masuk Hari Ini</h3>
          <span className="text-xs text-slate-400 font-medium">Ter-update otomatis</span>
        </div>

        {presensiList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Belum ada presensi masuk hari ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">DUDI</th>
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
