import React, { useEffect, useState } from 'react';
import api from '../../lib/api-client';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Plus } from 'lucide-react';

export const PenempatanPage: React.FC = () => {
  const [penempatanList, setPenempatanList] = useState<any[]>([]);
  const [muridList, setMuridList] = useState<any[]>([]);
  const [dudiList, setDudiList] = useState<any[]>([]);
  const [guruList, setGuruList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    murid_id: '',
    dudi_id: '',
    guru_id: '',
    tahun_ajaran_id: '1',
    tanggal_mulai: '2026-07-01',
    tanggal_selesai: '2026-12-31',
  });

  const fetchData = async () => {
    try {
      const [resP, resM, resD, resG] = await Promise.all([
        api.get('/penempatan-pkl'),
        api.get('/master-data/murid'),
        api.get('/master-data/dudi'),
        api.get('/master-data/guru'),
      ]);
      setPenempatanList(resP.data);
      setMuridList(resM.data);
      setDudiList(resD.data);
      setGuruList(resG.data);
    } catch {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/penempatan-pkl', {
        murid_id: parseInt(formData.murid_id),
        dudi_id: parseInt(formData.dudi_id),
        guru_id: parseInt(formData.guru_id),
        tahun_ajaran_id: parseInt(formData.tahun_ajaran_id),
        tanggal_mulai: formData.tanggal_mulai,
        tanggal_selesai: formData.tanggal_selesai,
      });
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan penempatan PKL');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Plotting Penempatan PKL</h1>
          <p className="text-xs text-slate-500 mt-1">Alokasikan siswa ke lokasi DUDI dan Guru Pembimbing.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Penempatan</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
          Daftar Penempatan Aktif ({penempatanList.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Lokasi DUDI</th>
                <th className="py-3 px-4">Guru Pembimbing</th>
                <th className="py-3 px-4">Periode</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {penempatanList.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{p.muridNama}</td>
                  <td className="py-3 px-4 text-slate-600">{p.kelasNama}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{p.dudiNama}</td>
                  <td className="py-3 px-4 text-slate-600">{p.guruNama}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(p.tanggalMulai).toLocaleDateString('id-ID')} s/d {new Date(p.tanggalSelesai).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="font-heading font-bold text-lg text-slate-900">Form Plotting Penempatan</h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa</label>
                <select
                  required
                  value={formData.murid_id}
                  onChange={(e) => setFormData({ ...formData, murid_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {muridList.map((m) => (
                    <option key={m.id} value={m.id}>{m.nama} ({m.kelasNama})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Lokasi DUDI</label>
                <select
                  required
                  value={formData.dudi_id}
                  onChange={(e) => setFormData({ ...formData, dudi_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="">-- Pilih DUDI --</option>
                  {dudiList.map((d) => (
                    <option key={d.id} value={d.id}>{d.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Guru Pembimbing</label>
                <select
                  required
                  value={formData.guru_id}
                  onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="">-- Pilih Guru --</option>
                  {guruList.map((g) => (
                    <option key={g.id} value={g.id}>{g.nama}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mulai</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selesai</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_selesai}
                    onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
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
                  {isSubmitting ? 'Simpan...' : 'Simpan Plotting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
