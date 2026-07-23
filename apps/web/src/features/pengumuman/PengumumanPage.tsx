import React, { useEffect, useState } from 'react';
import api from '../../lib/api-client';
import { Plus, CheckCircle, Calendar, Megaphone } from 'lucide-react';

export const PengumumanPage: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    target_role: '',
  });

  const fetchData = async () => {
    try {
      const res = await api.get('/pengumuman');
      setList(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAsRead = async (pengumumanId: number) => {
    try {
      await api.patch(`/pengumuman/${pengumumanId}/read`);
      fetchData();
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/pengumuman', {
        judul: formData.judul,
        isi: formData.isi,
        target_role: formData.target_role || undefined,
      });
      setShowModal(false);
      setFormData({ judul: '', isi: '', target_role: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim pengumuman');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Pengumuman & Informasi</h1>
          <p className="text-xs text-slate-500 mt-1">Pemberitahuan resmi dari pihak sekolah dan manajemen PKL.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Pengumuman</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-sm border border-slate-200">
            Belum ada pengumuman untuk Anda.
          </div>
        ) : (
          list.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-xs space-y-3 ${
                !item.isRead ? 'border-blue-300 ring-2 ring-blue-500/10' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Megaphone className="w-4 h-4 text-blue-600" />
                  <h3 className="font-heading font-bold text-slate-900 text-base">{item.judul}</h3>
                  {!item.isRead && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      Baru
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-medium flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-300" />
                  {new Date(item.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-normal">{item.isi}</p>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span>Penerbit: <strong>{item.authorNama}</strong></span>
                {!item.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(item.pengumumanId)}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Tandai Sudah Dibaca</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="font-heading font-bold text-lg text-slate-900">Buat Pengumuman Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Misal: Pengumpulan Laporan PKL Semester Ganjil"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Penerima</label>
                <select
                  value={formData.target_role}
                  onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                >
                  <option value="">Semua User (Admin, Guru, Siswa)</option>
                  <option value="murid">Hanya Siswa PKL</option>
                  <option value="guru">Hanya Guru Pembimbing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isi Pengumuman</label>
                <textarea
                  required
                  rows={5}
                  value={formData.isi}
                  onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                  placeholder="Tuliskan pesan pengumuman lengkap di sini..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
