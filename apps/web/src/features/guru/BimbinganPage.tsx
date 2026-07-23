import React, { useEffect, useState } from 'react';
import api from '../../lib/api-client';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Users, CheckCircle2, XCircle, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';

export const BimbinganPage: React.FC = () => {
  const [jurnalList, setJurnalList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [catatan, setCatatan] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchJurnal = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jurnal', { params: { status: 'pending' } });
      setJurnalList(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJurnal();
  }, []);

  const handleVerify = async (jurnalId: number, status: 'disetujui' | 'ditolak') => {
    setSubmitting(jurnalId);
    setMsg(null);
    try {
      await api.patch(`/jurnal/${jurnalId}/verify`, {
        status_verifikasi: status,
        catatan_verifikasi: catatan[jurnalId] || '',
      });
      setMsg({ type: 'success', text: `Jurnal berhasil di-${status === 'disetujui' ? 'setujui' : 'tolak'}.` });
      fetchJurnal();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal memproses verifikasi.' });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Siswa Bimbingan</h1>
        <p className="text-xs text-slate-500 mt-1">
          Verifikasi jurnal harian dan permohonan izin dari siswa PKL bimbingan Anda.
        </p>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-heading font-bold text-slate-900 text-base flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <span>Jurnal Menunggu Verifikasi</span>
          </h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full font-medium">
            {jurnalList.length} Entri
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Memuat data...</div>
        ) : jurnalList.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">Tidak ada jurnal yang perlu diverifikasi.</p>
            <p className="text-xs text-slate-400 mt-1">Semua jurnal siswa bimbingan sudah diproses.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jurnalList.map((item) => (
              <div key={item.id} className="p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.muridNama}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(item.tanggal).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={item.statusVerifikasi} />
                    {expandedId === item.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {expandedId === item.id && (
                  <div className="mt-4 bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Aktivitas Siswa</p>
                    <p className="text-sm text-slate-800 leading-relaxed">{item.deskripsiAktivitas}</p>

                    {item.fotoKegiatan && (
                      <a
                        href={item.fotoKegiatan}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs text-blue-600 font-medium hover:underline"
                      >
                        Lihat Foto Kegiatan →
                      </a>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Catatan Verifikasi (opsional)
                      </label>
                      <textarea
                        rows={2}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Tuliskan feedback atau catatan untuk siswa..."
                        value={catatan[item.id] || ''}
                        onChange={(e) => setCatatan((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleVerify(item.id, 'disetujui')}
                        disabled={submitting === item.id}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Setujui</span>
                      </button>
                      <button
                        onClick={() => handleVerify(item.id, 'ditolak')}
                        disabled={submitting === item.id}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
