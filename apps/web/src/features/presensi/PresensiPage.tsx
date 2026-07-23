import React, { useState, useEffect } from 'react';
import api from '../../lib/api-client';
import { CameraCapture } from '../../components/shared/CameraCapture';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { MapPin, Building, Calendar, CheckCircle2, Clock } from 'lucide-react';

export const PresensiPage: React.FC = () => {
  const [dataStatus, setDataStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msgStatus, setMsgStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/presensi/today');
      setDataStatus(res.data);
    } catch (err: any) {
      setMsgStatus({ type: 'error', message: err.response?.data?.message || 'Gagal memuat status presensi' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCaptureCheckin = async (file: File, coords: { lat: number; lng: number }) => {
    setSubmitting(true);
    setMsgStatus(null);
    try {
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('latitude', coords.lat.toString());
      formData.append('longitude', coords.lng.toString());

      const res = await api.post('/presensi/checkin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMsgStatus({ type: 'success', message: res.data.message });
      fetchStatus();
    } catch (err: any) {
      setMsgStatus({
        type: 'error',
        message: err.response?.data?.message || 'Presensi masuk gagal. Mohon pastikan lokasi dan foto sesuai.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCaptureCheckout = async (file: File, coords: { lat: number; lng: number }) => {
    setSubmitting(true);
    setMsgStatus(null);
    try {
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('latitude', coords.lat.toString());
      formData.append('longitude', coords.lng.toString());

      const res = await api.post('/presensi/checkout', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMsgStatus({ type: 'success', message: res.data.message });
      fetchStatus();
    } catch (err: any) {
      setMsgStatus({
        type: 'error',
        message: err.response?.data?.message || 'Presensi pulang gagal.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-sm font-medium">Memuat data presensi...</p>
      </div>
    );
  }

  const { penempatan, presensi } = dataStatus || {};

  if (!penempatan) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center shadow-xs border border-slate-200">
        <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-heading text-lg font-bold text-slate-900 mb-1">Belum Ada Penempatan Active</h3>
        <p className="text-xs text-slate-500">
          Anda belum diposisikan di DUDI manapun oleh Administrator/Guru Pembimbing.
        </p>
      </div>
    );
  }

  const hasCheckedIn = !!presensi?.jamMasuk;
  const hasCheckedOut = !!presensi?.jamPulang;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
          <Building className="w-4 h-4" />
          <span>Lokasi Penempatan PKL</span>
        </div>
        <h2 className="font-heading text-xl font-bold">{penempatan.dudiNama}</h2>
        <div className="flex items-center space-x-3 text-xs text-blue-100 mt-2">
          <span className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1" /> Radius {penempatan.radiusMeter}m
          </span>
          <span className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1" /> {penempatan.hariKerja}
          </span>
        </div>
      </div>

      {msgStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium ${
            msgStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {msgStatus.message}
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">Status Presensi Hari Ini</p>
          <div className="mt-1 flex items-center space-x-2">
            {hasCheckedIn ? (
              <StatusBadge status={presensi.statusMasuk || 'tepat_waktu'} />
            ) : (
              <StatusBadge status="pending" label="Belum Absen Masuk" />
            )}
            {hasCheckedOut && <StatusBadge status={presensi.statusPulang || 'tepat_waktu'} label="Sudah Pulang" />}
          </div>
        </div>
        {hasCheckedIn && (
          <div className="text-right">
            <p className="text-xs text-slate-400">Jam Masuk</p>
            <p className="text-sm font-bold text-slate-800">
              {new Date(presensi.jamMasuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
      </div>

      {!hasCheckedIn ? (
        <div>
          <h3 className="font-heading font-semibold text-slate-900 text-sm mb-2 px-1">Presensi Masuk (Selfie + GPS)</h3>
          <CameraCapture
            targetLat={penempatan.dudiLatitude}
            targetLng={penempatan.dudiLongitude}
            radiusMeter={penempatan.radiusMeter}
            onCapture={handleCaptureCheckin}
            isSubmitting={submitting}
          />
        </div>
      ) : !hasCheckedOut ? (
        <div>
          <h3 className="font-heading font-semibold text-slate-900 text-sm mb-2 px-1">Presensi Pulang (Selfie + GPS)</h3>
          <CameraCapture
            targetLat={penempatan.dudiLatitude}
            targetLng={penempatan.dudiLongitude}
            radiusMeter={penempatan.radiusMeter}
            onCapture={handleCaptureCheckout}
            isSubmitting={submitting}
          />
        </div>
      ) : (
        <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-200 shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-heading text-base font-bold text-emerald-900">Presensi Lengkap!</h3>
          <p className="text-xs text-emerald-700 mt-1">
            Anda telah menyelesaikan presensi masuk dan pulang untuk hari ini. Terima kasih!
          </p>
        </div>
      )}
    </div>
  );
};
