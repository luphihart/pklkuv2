export enum Role {
  ADMIN = 'admin',
  GURU = 'guru',
  MURID = 'murid',
}

export enum StatusPenempatan {
  AKTIF = 'aktif',
  SELESAI = 'selesai',
  BATAL = 'batal',
}

export enum StatusPresensiMasuk {
  TEPAT_WAKTU = 'tepat_waktu',
  TERLAMBAT = 'terlambat',
}

export enum StatusPresensiPulang {
  PULANG_CEPAT = 'pulang_cepat',
  TEPAT_WAKTU = 'tepat_waktu',
}

export enum StatusApproval {
  PENDING = 'pending',
  DISETUJUI = 'disetujui',
  DITOLAK = 'ditolak',
}

export enum TipeIzin {
  IZIN = 'izin',
  SAKIT = 'sakit',
}

export enum TipeIndikator {
  GURU = 'guru',
  INDUSTRI = 'industri',
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  photo?: string | null;
  tanggal_lahir?: string | null;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}
