import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, FileText, AlertCircle } from 'lucide-react';

interface Props {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, label, size = 'md' }) => {
  const normalized = status.toLowerCase();

  const getStyle = () => {
    switch (normalized) {
      case 'disetujui':
      case 'tepat_waktu':
      case 'hadir':
      case 'aktif':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />,
          defaultLabel: label || (normalized === 'tepat_waktu' ? 'Tepat Waktu' : normalized === 'disetujui' ? 'Disetujui' : 'Aktif'),
        };
      case 'pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600 mr-1.5" />,
          defaultLabel: label || 'Menunggu Approval',
        };
      case 'terlambat':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-600 mr-1.5" />,
          defaultLabel: label || 'Terlambat',
        };
      case 'ditolak':
      case 'alfa':
      case 'batal':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-600 mr-1.5" />,
          defaultLabel: label || (normalized === 'ditolak' ? 'Ditolak' : 'Alfa'),
        };
      case 'izin':
      case 'sakit':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <FileText className="w-3.5 h-3.5 text-sky-600 mr-1.5" />,
          defaultLabel: label || (normalized === 'izin' ? 'Izin' : 'Sakit'),
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <AlertCircle className="w-3.5 h-3.5 text-slate-500 mr-1.5" />,
          defaultLabel: label || status,
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border px-2.5 py-0.5 ${
        size === 'sm' ? 'text-xs' : 'text-xs font-semibold px-3 py-1'
      } ${style.bg}`}
    >
      {style.icon}
      {style.defaultLabel}
    </span>
  );
};
