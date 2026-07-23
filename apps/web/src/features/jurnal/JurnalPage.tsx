import React, { useState, useEffect } from 'react';
import api from '../../lib/api-client';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Plus, Send, Calendar } from 'lucide-react';

export const JurnalPage: React.FC = () => {
  const [jurnalList, setJurnalList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deskripsi, setDeskripsi] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchJurnal = async () => {
    try {
      const res = await api.get('/jurnal');
      setJurnalList(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchJurnal();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);
    try {
      const formData = new FormData();
      formData.append('deskripsi_aktivitas', deskripsi);
      if (fotoFile) {
        formData.append('foto', fotoFile);
      }

      await api.post('/jurnal', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMsg('Jurnal harian berhasil dikirim untuk verifikasi guru!');
      setDeskripsi('');
      setFotoFile(null);
      setShowForm(false);
      fetchJurnal();
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Gagal membuat jurnal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-slate-900">Jurnal Harian PKL</h1>
          <p className="text-xs text-slate-500">Catat pekerjaan dan kegiatan harian di lokasi DUDI.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Isi Jurnal</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          {msg}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-heading font-bold text-slate-900 text-sm">Formulir Jurnal Kegiatan</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Aktivitas Pekerjaan</label>
            <textarea
              required
              rows={4}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan secara rinci kegiatan, tugas, atau tantangan pekerjaan yang diselesaikan hari ini..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Foto Bukti Kegiatan (Opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="py-2 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Jurnal'}</span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {jurnalList.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-slate-400 text-xs border border-slate-200">
            Belum ada entri jurnal harian. Klik "Isi Jurnal" untuk menambahkan kegiatan pertama Anda.
          </div>
        ) : (
          jurnalList.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center font-medium">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {new Date(item.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <StatusBadge status={item.statusVerifikasi} />
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-normal">{item.deskripsiAktivitas}</p>

              {item.catatanVerifikasi && (
                <div className="p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-100 italic">
                  <span className="font-semibold not-italic">Catatan Guru ({item.verifiedByGuru}): </span>
                  "{item.catatanVerifikasi}"
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
