import React, { useEffect, useState } from 'react';
import api from '../../lib/api-client';
import { Plus, MapPin, Calendar, Download } from 'lucide-react';

export const KunjunganPage: React.FC = () => {
  const [kunjunganList, setKunjunganList] = useState<any[]>([]);
  const [penempatanList, setPenempatanList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    penempatan_pkl_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    jenis_kunjungan: 'Monitoring Berkala',
    deskripsi_kunjungan: '',
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      const [resK, resP] = await Promise.all([
        api.get('/kunjungan'),
        api.get('/penempatan-pkl'),
      ]);
      setKunjunganList(resK.data);
      setPenempatanList(resP.data);
    } catch {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append('penempatan_pkl_id', formData.penempatan_pkl_id);
      body.append('tanggal', formData.tanggal);
      body.append('jenis_kunjungan', formData.jenis_kunjungan);
      body.append('deskripsi_kunjungan', formData.deskripsi_kunjungan);
      if (fotoFile) body.append('foto', fotoFile);

      await api.post('/kunjungan', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowModal(false);
      setFormData({
        penempatan_pkl_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        jenis_kunjungan: 'Monitoring Berkala',
        deskripsi_kunjungan: '',
      });
      setFotoFile(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan log kunjungan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL || '/api'}/kunjungan/rekap-pdf`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Kunjungan Monitoring DUDI</h1>
          <p className="text-xs text-slate-500 mt-1">Catat log kunjungan lapangan guru pembimbing ke lokasi industri.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDownloadPdf}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs shadow-xs flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Cetak Rekap PDF</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kunjungan</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {kunjunganList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-sm border border-slate-200">
            Belum ada catatan log kunjungan monitoring.
          </div>
        ) : (
          kunjunganList.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                    {item.jenisKunjungan}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{item.muridNama} ({item.kelasNama})</span>
                </div>
                <span className="text-xs text-slate-500 font-medium flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {new Date(item.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center text-xs text-slate-600 font-medium">
                <MapPin className="w-4 h-4 text-rose-500 mr-1.5" />
                <span>Lokasi DUDI: <strong>{item.dudiNama}</strong></span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed">{item.deskripsiKunjungan}</p>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="font-heading font-bold text-lg text-slate-900">Catat Kunjungan Lapangan</h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa / Penempatan</label>
                <select
                  required
                  value={formData.penempatan_pkl_id}
                  onChange={(e) => setFormData({ ...formData, penempatan_pkl_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="">-- Pilih Siswa PKL --</option>
                  {penempatanList.map((p) => (
                    <option key={p.id} value={p.id}>{p.muridNama} — {p.dudiNama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Kunjungan</label>
                <input
                  type="date"
                  required
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Kunjungan</label>
                <select
                  value={formData.jenis_kunjungan}
                  onChange={(e) => setFormData({ ...formData, jenis_kunjungan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                >
                  <option value="Monitoring Berkala">Monitoring Berkala</option>
                  <option value="Evaluasi Awal">Evaluasi Awal</option>
                  <option value="Evaluasi Tengah Periode">Evaluasi Tengah Periode</option>
                  <option value="Penjemputan Siswa PKL">Penjemputan Siswa PKL</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Hasil Kunjungan</label>
                <textarea
                  required
                  rows={4}
                  value={formData.deskripsi_kunjungan}
                  onChange={(e) => setFormData({ ...formData, deskripsi_kunjungan: e.target.value })}
                  placeholder="Catat kondisi siswa di DUDI, arahan dari pembimbing industri, atau evaluasi pekerjaan..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Foto Bukti Kunjungan (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-4 rounded-xl bg-blue-600 text-white font-semibold"
                >
                  {isSubmitting ? 'Simpan...' : 'Simpan Kunjungan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
