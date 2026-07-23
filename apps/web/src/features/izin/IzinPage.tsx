import React, { useState, useEffect } from 'react';
import api from '../../lib/api-client';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Plus, Send, Calendar } from 'lucide-react';

export const IzinPage: React.FC = () => {
  const [izinList, setIzinList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [tipe, setTipe] = useState<'izin' | 'sakit'>('izin');
  const [alasan, setAlasan] = useState('');
  const [suratFile, setSuratFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchIzin = async () => {
    try {
      const res = await api.get('/izin-sakit');
      setIzinList(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchIzin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);
    try {
      const formData = new FormData();
      formData.append('tanggal_mulai', tanggalMulai);
      formData.append('tanggal_selesai', tanggalSelesai);
      formData.append('tipe', tipe);
      formData.append('alasan', alasan);
      if (suratFile) {
        formData.append('surat', suratFile);
      }

      await api.post('/izin-sakit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMsg('Pengajuan izin/sakit berhasil dikirim!');
      setTanggalMulai('');
      setTanggalSelesai('');
      setAlasan('');
      setSuratFile(null);
      setShowForm(false);
      fetchIzin();
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Gagal membuat pengajuan izin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-slate-900">Pengajuan Izin / Sakit</h1>
          <p className="text-xs text-slate-500">Ajukan perizinan tidak hadir PKL ke Guru Pembimbing.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Izin</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          {msg}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-heading font-bold text-slate-900 text-sm">Formulir Perizinan</h3>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                required
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
              <input
                type="date"
                required
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Pengajuan</label>
            <select
              value={tipe}
              onChange={(e: any) => setTipe(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
            >
              <option value="izin">Izin Tidak Hadir</option>
              <option value="sakit">Sakit (Lampiran Dokter/Surat)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Keterangan</label>
            <textarea
              required
              rows={3}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Berikan alasan yang jelas mengenai perizinan Anda..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Surat Pendukung (Opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSuratFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
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
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Izin'}</span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {izinList.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-slate-400 text-xs border border-slate-200">
            Belum ada riwayat perizinan.
          </div>
        ) : (
          izinList.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center font-medium">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {new Date(item.tanggalMulai).toLocaleDateString('id-ID')} s/d {new Date(item.tanggalSelesai).toLocaleDateString('id-ID')}
                </span>
                <StatusBadge status={item.statusApproval} />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {item.tipe}
                </span>
                <p className="text-xs text-slate-800 font-medium">{item.alasan}</p>
              </div>

              {item.catatanGuru && (
                <div className="p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-100 italic">
                  <span className="font-semibold not-italic">Guru ({item.approvedByGuru}): </span>
                  "{item.catatanGuru}"
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
