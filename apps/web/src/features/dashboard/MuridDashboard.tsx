import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api-client';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Camera, BookOpen, FileText, Building, MapPin, ArrowRight } from 'lucide-react';

export const MuridDashboard: React.FC = () => {
  const [dataStatus, setDataStatus] = useState<any>(null);

  useEffect(() => {
    api.get('/presensi/today').then((res) => setDataStatus(res.data)).catch(() => {});
  }, []);

  const { penempatan, presensi } = dataStatus || {};

  return (
    <div className="space-y-4">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
          <Building className="w-48 h-48" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">Dashboard Siswa PKL</p>
        <h1 className="font-heading text-2xl font-bold mt-1">Selamat Datang!</h1>
        <p className="text-xs text-blue-100 mt-1 max-w-xs">
          Jangan lupa isi presensi masuk & jurnal harian kegiatan PKL Anda tepat waktu.
        </p>
      </div>

      {/* DUDI Placement Summary Card */}
      {penempatan ? (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Tempat Magang / DUDI</p>
              <h3 className="font-heading font-bold text-slate-900 text-base">{penempatan.dudiNama}</h3>
              <p className="text-xs text-slate-500 flex items-center mt-0.5">
                <MapPin className="w-3 h-3 mr-1 text-slate-400" /> Radius Geofence {penempatan.radiusMeter} Meter
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Today Attendance Quick Status */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-slate-900 text-sm">Status Hari Ini</h3>
          <Link to="/murid/presensi" className="text-xs font-semibold text-blue-600 flex items-center hover:underline">
            <span>Buka Presensi</span> <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5 flex items-center justify-between border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Presensi Digital</p>
              <p className="text-xs text-slate-500">
                {presensi?.jamMasuk
                  ? `Check-in: ${new Date(presensi.jamMasuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Belum presensi hari ini'}
              </p>
            </div>
          </div>

          <StatusBadge
            status={presensi?.jamMasuk ? presensi.statusMasuk || 'tepat_waktu' : 'pending'}
            label={presensi?.jamMasuk ? undefined : 'Belum Absen'}
          />
        </div>
      </div>

      {/* Quick Access Menu Grid */}
      <div>
        <h3 className="font-heading font-semibold text-slate-900 text-sm mb-2.5 px-1">Menu Utama</h3>
        <div className="grid grid-cols-3 gap-3">
          <Link
            to="/murid/presensi"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Presensi</span>
          </Link>

          <Link
            to="/murid/jurnal"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Jurnal</span>
          </Link>

          <Link
            to="/murid/izin"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Izin / Sakit</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
