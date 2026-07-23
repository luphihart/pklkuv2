import React, { useEffect, useState } from 'react';
import api from '../../lib/api-client';
import { Plus, MapPin } from 'lucide-react';

export const DudiListPage: React.FC = () => {
  const [dudiList, setDudiList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    latitude: '-6.2088',
    longitude: '106.8456',
    radiusMeter: '100',
    picNama: '',
    picPhone: '',
    hariKerja: 'Senin,Selasa,Rabu,Kamis,Jumat',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDudi = async () => {
    try {
      const res = await api.get('/master-data/dudi');
      setDudiList(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchDudi();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/master-data/dudi', formData);
      setShowModal(false);
      setFormData({
        nama: '',
        alamat: '',
        latitude: '-6.2088',
        longitude: '106.8456',
        radiusMeter: '100',
        picNama: '',
        picPhone: '',
        hariKerja: 'Senin,Selasa,Rabu,Kamis,Jumat',
      });
      fetchDudi();
    } catch {
      alert('Gagal menambah DUDI');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Manajemen DUDI (Dunia Usaha & Industri)</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola data lokasi DUDI, radius geofence presensi, dan pembimbing industri.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center space-x-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah DUDI</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dudiList.map((dudi) => (
          <div key={dudi.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-lg">{dudi.nama}</h3>
                <p className="text-xs text-slate-500 flex items-center mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
                  {dudi.alamat || 'Alamat belum diatur'}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Radius {dudi.radiusMeter}m
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <p className="text-slate-400 font-medium">Koordinat Geofence</p>
                <p className="font-mono mt-0.5">{dudi.latitude.toFixed(4)}, {dudi.longitude.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Hari Kerja</p>
                <p className="mt-0.5">{dudi.hariKerja}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="font-heading font-bold text-lg text-slate-900">Tambah Data DUDI Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Perusahaan / DUDI</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="PT Teknologi Utama"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Radius (Meter)</label>
                  <input
                    type="number"
                    required
                    value={formData.radiusMeter}
                    onChange={(e) => setFormData({ ...formData, radiusMeter: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200"
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
                  {isSubmitting ? 'Simpan...' : 'Simpan DUDI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
