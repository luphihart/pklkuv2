import React, { useEffect, useState } from 'react';
import api from '../../lib/api-client';
import { Save, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await api.patch('/settings', { key, value });
      }
      setMsg('Pengaturan sistem berhasil disimpan!');
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Pengaturan Sistem PKLku</h1>
          <p className="text-xs text-slate-500 mt-1">Konfigurasi parameter operasional dan bobot penilaian PKL.</p>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center">
          <SettingsIcon className="w-4 h-4 text-blue-600 mr-2" />
          <span>Konfigurasi Sekolah & Toleransi Presensi</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Sekolah</label>
            <input
              type="text"
              value={settings.nama_sekolah || ''}
              onChange={(e) => handleChange('nama_sekolah', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Toleransi Terlambat (Menit)</label>
            <input
              type="number"
              value={settings.toleransi_terlambat_menit || '15'}
              onChange={(e) => handleChange('toleransi_terlambat_menit', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jam Masuk Default</label>
            <input
              type="time"
              value={settings.jam_masuk_default || '07:30'}
              onChange={(e) => handleChange('jam_masuk_default', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jam Pulang Default</label>
            <input
              type="time"
              value={settings.jam_pulang_default || '16:00'}
              onChange={(e) => handleChange('jam_pulang_default', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center pt-3 border-t border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2" />
          <span>Bobot Penilaian Rapor PKL</span>
        </h3>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bobot Aspek Sekolah (%)</label>
            <input
              type="number"
              value={settings.bobot_sekolah || '40'}
              onChange={(e) => handleChange('bobot_sekolah', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bobot Aspek Industri (%)</label>
            <input
              type="number"
              value={settings.bobot_industri || '60'}
              onChange={(e) => handleChange('bobot_industri', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
