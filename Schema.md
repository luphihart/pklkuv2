# Schema.md — PKLku (Final)
## Struktur Database PostgreSQL

Sumber kebenaran skema ada di `apps/api/prisma/schema.prisma`. Dokumen ini adalah representasi naratifnya: tabel, relasi, tipe data, dan constraint. **Pembimbing Industri tidak memiliki relasi ke tabel `users`** — tidak ada login untuk role ini (lihat PRD.md §4.4).

---

## 1. Entity Relationship Overview

```
users ──1:1── guru ──┐
users ──1:1── murid ─┤
                      │
jurusan ──1:N── kelas ──1:N── murid
                                │
dudi ──1:N── pembimbing_industri
                                │
        ┌───────────────────────┴─────────────────────┐
        │            penempatan_pkl                     │
        │  (murid_id, dudi_id, guru_id,                  │
        │   pembimbing_industri_id?, tahun_ajaran_id)    │
        └───────────────────────┬─────────────────────┘
                                 │ 1:N
        ┌────────────┬──────────┼───────────┬──────────────┐
        ▼            ▼          ▼           ▼              ▼
   presensi    izin_sakit    jurnal   kunjungan_    penilaian_pkl (1:1)
                                        monitoring

tujuan_pembelajaran ──1:N── indikator_penilaian

users ──1:N── audit_logs
users ──1:N── pengumuman (sebagai penulis)
pengumuman ──1:N── pengumuman_penerima ──N:1── users
```

**Entitas tanpa akun login**: `dudi`, `pembimbing_industri` — keduanya murni data master, dikelola CRUD-nya oleh Admin/Guru lewat modul `master-data`.

---

## 2. Tabel & Detail Kolom

### 2.1. `users`
Kredensial login — **hanya untuk role `admin`, `guru`, `murid`.**

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | `BIGSERIAL` | PK | |
| `name` | `VARCHAR(255)` | NOT NULL | |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Username login |
| `email_verified_at` | `TIMESTAMP` | NULLABLE | |
| `password` | `VARCHAR(255)` | NOT NULL | Hash bcrypt |
| `role` | `ENUM('admin','guru','murid')` | NOT NULL | **Tidak ada nilai 'dudi'** |
| `phone` | `VARCHAR(20)` | NULLABLE | |
| `photo` | `VARCHAR(255)` | NULLABLE | |
| `tanggal_lahir` | `DATE` | NULLABLE | |
| `refresh_token_hash` | `VARCHAR(255)` | NULLABLE | Hash refresh token JWT aktif |
| `created_at`, `updated_at` | `TIMESTAMP` | NULLABLE | |
| `deleted_at` | `TIMESTAMP` | NULLABLE | Soft delete |

### 2.2. `tahun_ajaran`
| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | `BIGSERIAL` | PK | |
| `tahun` | `VARCHAR(20)` | NOT NULL | Format `2025/2026` |
| `semester` | `ENUM('ganjil','genap')` | NOT NULL | |
| `status` | `ENUM('aktif','nonaktif')` | NOT NULL, DEFAULT `'nonaktif'` | Idealnya di-enforce di application layer: hanya 1 baris `status='aktif'` pada satu waktu |
| `created_at`, `updated_at`, `deleted_at` | `TIMESTAMP` | NULLABLE | |

### 2.3. `jurusan`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `kode` | `VARCHAR(20)` | UNIQUE, NOT NULL |
| `nama` | `VARCHAR(255)` | NOT NULL |
| `singkatan` | `VARCHAR(50)` | NULLABLE |
| `created_at`, `updated_at`, `deleted_at` | `TIMESTAMP` | NULLABLE |

### 2.4. `kelas`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `jurusan_id` | `BIGINT` | FK → `jurusan(id)` ON DELETE CASCADE, NOT NULL |
| `nama` | `VARCHAR(100)` | NOT NULL |
| `created_at`, `updated_at`, `deleted_at` | `TIMESTAMP` | NULLABLE |

### 2.5. `guru`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `user_id` | `BIGINT` | FK → `users(id)` ON DELETE CASCADE, **UNIQUE**, NOT NULL |
| `nip` | `VARCHAR(50)` | UNIQUE, NULLABLE |
| `nama` | `VARCHAR(255)` | NOT NULL |
| `created_at`, `updated_at`, `deleted_at` | `TIMESTAMP` | NULLABLE |

### 2.6. `murid`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `user_id` | `BIGINT` | FK → `users(id)` ON DELETE CASCADE, **UNIQUE**, NOT NULL |
| `kelas_id` | `BIGINT` | FK → `kelas(id)` ON DELETE CASCADE, NOT NULL |
| `nis` | `VARCHAR(50)` | UNIQUE, NOT NULL |
| `nama` | `VARCHAR(255)` | NOT NULL |
| `created_at`, `updated_at`, `deleted_at` | `TIMESTAMP` | NULLABLE |

### 2.7. `dudi` — *tanpa akun login*
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `nama` | `VARCHAR(255)` | NOT NULL |
| `alamat` | `TEXT` | NULLABLE |
| `latitude` | `DOUBLE PRECISION` | NOT NULL, CHECK (`-90 <= latitude <= 90`) |
| `longitude` | `DOUBLE PRECISION` | NOT NULL, CHECK (`-180 <= longitude <= 180`) |
| `radius_meter` | `INTEGER` | NOT NULL, DEFAULT `50`, CHECK (`radius_meter > 0`) |
| `pic_nama` | `VARCHAR(255)` | NULLABLE |
| `pic_phone` | `VARCHAR(20)` | NULLABLE |
| `hari_kerja` | `VARCHAR(255)` | NOT NULL, DEFAULT `'Senin,Selasa,Rabu,Kamis,Jumat'` |
| `created_at`, `updated_at`, `deleted_at` | `TIMESTAMP` | NULLABLE |

Diinput & dikelola sepenuhnya oleh **Admin**.

### 2.8. `pembimbing_industri` — *tanpa akun login*
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `dudi_id` | `BIGINT` | FK → `dudi(id)` ON DELETE CASCADE, NOT NULL |
| `nama` | `VARCHAR(255)` | NOT NULL |
| `phone` | `VARCHAR(20)` | NULLABLE |
| `email` | `VARCHAR(100)` | NULLABLE |
| `created_at`, `updated_at`, `deleted_at` | `TIMESTAMP` | NULLABLE |

Diinput oleh **Admin atau Guru** (bukan self-service). **Tidak ada kolom `user_id`** — secara desain tabel ini tidak pernah terhubung ke `users`.

### 2.9. `penempatan_pkl` — relasi utama
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `murid_id` | `BIGINT` | FK → `murid(id)` ON DELETE CASCADE, NOT NULL |
| `dudi_id` | `BIGINT` | FK → `dudi(id)` ON DELETE CASCADE, NOT NULL |
| `guru_id` | `BIGINT` | FK → `guru(id)` ON DELETE CASCADE, NOT NULL |
| `pembimbing_industri_id` | `BIGINT` | FK → `pembimbing_industri(id)` ON DELETE **SET NULL**, NULLABLE |
| `tahun_ajaran_id` | `BIGINT` | FK → `tahun_ajaran(id)` ON DELETE CASCADE, NOT NULL |
| `tanggal_mulai` | `DATE` | NOT NULL |
| `tanggal_selesai` | `DATE` | NOT NULL, CHECK (`tanggal_selesai >= tanggal_mulai`) |
| `status` | `ENUM('aktif','selesai','batal')` | NOT NULL, DEFAULT `'aktif'` |
| `created_at`, `updated_at`, `deleted_at` | `TIMESTAMP` | NULLABLE |

**Index rekomendasi**: `(murid_id, status)` — query "penempatan aktif milik murid X" adalah query paling sering dipanggil (dieksekusi di hampir setiap request presensi).

### 2.10. `presensi`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `penempatan_pkl_id` | `BIGINT` | FK → `penempatan_pkl(id)` ON DELETE CASCADE, NOT NULL |
| `tanggal` | `DATE` | NOT NULL |
| `jam_masuk` | `TIME` | NULLABLE |
| `jam_pulang` | `TIME` | NULLABLE |
| `lat_masuk`, `lng_masuk` | `DOUBLE PRECISION` | NULLABLE |
| `lat_pulang`, `lng_pulang` | `DOUBLE PRECISION` | NULLABLE |
| `foto_masuk`, `foto_pulang` | `VARCHAR(255)` | NULLABLE |
| `status_masuk` | `ENUM('tepat_waktu','terlambat')` | NULLABLE |
| `status_pulang` | `ENUM('pulang_cepat','tepat_waktu')` | NULLABLE |
| `created_at`, `updated_at` | `TIMESTAMP` | NULLABLE |

**Constraint**: `UNIQUE (penempatan_pkl_id, tanggal)` — mencegah duplikasi presensi per hari, sekaligus jadi target upsert.

### 2.11. `izin_sakit`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `penempatan_pkl_id` | `BIGINT` | FK → `penempatan_pkl(id)` ON DELETE CASCADE, NOT NULL |
| `tanggal_mulai` | `DATE` | NOT NULL |
| `tanggal_selesai` | `DATE` | NOT NULL, CHECK (`tanggal_selesai >= tanggal_mulai`) |
| `tipe` | `ENUM('izin','sakit')` | NOT NULL |
| `alasan` | `TEXT` | NOT NULL |
| `surat_pendukung` | `VARCHAR(255)` | NULLABLE — hanya path jpg/jpeg/png |
| `status_approval` | `ENUM('pending','disetujui','ditolak')` | NOT NULL, DEFAULT `'pending'` |
| `catatan_guru` | `TEXT` | NULLABLE |
| `approved_by` | `BIGINT` | FK → `guru(id)` ON DELETE SET NULL, NULLABLE |
| `created_at`, `updated_at` | `TIMESTAMP` | NULLABLE |

### 2.12. `jurnal`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `penempatan_pkl_id` | `BIGINT` | FK → `penempatan_pkl(id)` ON DELETE CASCADE, NOT NULL |
| `tanggal` | `DATE` | NOT NULL |
| `deskripsi_aktivitas` | `TEXT` | NOT NULL |
| `foto_kegiatan` | `VARCHAR(255)` | NULLABLE |
| `status_verifikasi` | `ENUM('pending','disetujui','ditolak')` | NOT NULL, DEFAULT `'pending'` |
| `catatan_verifikasi` | `TEXT` | NULLABLE — dipakai juga mencatat konfirmasi lisan dari pembimbing industri (lihat PRD §4.4) |
| `verified_by` | `BIGINT` | FK → `guru(id)` ON DELETE SET NULL, NULLABLE |
| `created_at`, `updated_at` | `TIMESTAMP` | NULLABLE |

### 2.13. `kunjungan_monitoring`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `penempatan_pkl_id` | `BIGINT` | FK → `penempatan_pkl(id)` ON DELETE CASCADE, NOT NULL |
| `tanggal` | `DATE` | NOT NULL |
| `jenis_kunjungan` | `VARCHAR(255)` | NOT NULL, DEFAULT `'Monitoring Berkala'` |
| `deskripsi_kunjungan` | `TEXT` | NOT NULL |
| `foto_kunjungan` | `VARCHAR(255)` | NULLABLE |
| `latitude`, `longitude` | `DOUBLE PRECISION` | NULLABLE |
| `created_at`, `updated_at` | `TIMESTAMP` | NULLABLE |

### 2.14. `tujuan_pembelajaran`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `nomor` | `INTEGER` | NOT NULL |
| `nama` | `VARCHAR(255)` | NOT NULL |
| `created_at`, `updated_at` | `TIMESTAMP` | NULLABLE |

### 2.15. `indikator_penilaian`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `tujuan_pembelajaran_id` | `BIGINT` | FK → `tujuan_pembelajaran(id)` ON DELETE CASCADE, NOT NULL |
| `nomor_urut` | `VARCHAR(10)` | NOT NULL |
| `nama` | `VARCHAR(255)` | NOT NULL |
| `deskripsi` | `TEXT` | NULLABLE |
| `tipe` | `ENUM('guru','industri')` | NOT NULL, DEFAULT `'guru'` |
| `created_at`, `updated_at` | `TIMESTAMP` | NULLABLE |

### 2.16. `penilaian_pkl`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `penempatan_pkl_id` | `BIGINT` | FK → `penempatan_pkl(id)` ON DELETE CASCADE, **UNIQUE**, NOT NULL |
| `nilai_guru_json` | `JSONB` | NULLABLE |
| `nilai_industri_json` | `JSONB` | NULLABLE — diisi Guru/Admin atas nama DUDI |
| `rata_nilai_guru` | `DOUBLE PRECISION` | NOT NULL, DEFAULT `0` |
| `rata_nilai_industri` | `DOUBLE PRECISION` | NOT NULL, DEFAULT `0` |
| `nilai_akhir` | `DOUBLE PRECISION` | NOT NULL, DEFAULT `0` |
| `catatan` | `TEXT` | NULLABLE |
| `keterangan_tp_json` | `JSONB` | NULLABLE |
| `created_at`, `updated_at` | `TIMESTAMP` | NULLABLE |

### 2.17. `pengumuman`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `judul` | `VARCHAR(255)` | NOT NULL |
| `isi` | `TEXT` | NOT NULL |
| `penulis_id` | `BIGINT` | FK → `users(id)`, NOT NULL |
| `created_at`, `updated_at` | `TIMESTAMP` | NULLABLE |

### 2.18. `pengumuman_penerima`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `pengumuman_id` | `BIGINT` | FK → `pengumuman(id)` ON DELETE CASCADE, NOT NULL |
| `user_id` | `BIGINT` | FK → `users(id)` ON DELETE CASCADE, NOT NULL |
| `is_read` | `BOOLEAN` | NOT NULL, DEFAULT `false` |
| `read_at` | `TIMESTAMP` | NULLABLE |

**Constraint tambahan direkomendasikan**: `UNIQUE (pengumuman_id, user_id)` — mencegah duplikasi baris penerima yang sama.

### 2.19. `settings`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `key` | `VARCHAR(255)` | UNIQUE, NOT NULL |
| `value` | `TEXT` | NULLABLE |
| `created_at`, `updated_at` | `TIMESTAMP` | NULLABLE |

### 2.20. `audit_logs`
| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `user_id` | `BIGINT` | FK → `users(id)` ON DELETE SET NULL, NULLABLE |
| `aktivitas` | `VARCHAR(255)` | NOT NULL |
| `ip_address` | `VARCHAR(45)` | NULLABLE |
| `user_agent` | `TEXT` | NULLABLE |
| `payload` | `JSONB` | NULLABLE |
| `created_at`, `updated_at` | `TIMESTAMP` | NULLABLE |

---

## 3. Ringkasan Index

| Tabel | Index | Alasan |
|---|---|---|
| `presensi` | UNIQUE `(penempatan_pkl_id, tanggal)` | Cegah duplikasi, target upsert |
| `penempatan_pkl` | `(murid_id, status)` | Query "penempatan aktif" — paling sering dipanggil |
| `penempatan_pkl` | `(guru_id, status)` | Data scoping guru → daftar murid bimbingan aktif |
| `users` | UNIQUE `(email)` | Login |
| `murid` | UNIQUE `(nis)`, UNIQUE `(user_id)` | Integritas data + relasi 1:1 |
| `guru` | UNIQUE `(nip)`, UNIQUE `(user_id)` | Integritas data + relasi 1:1 |
| `settings` | UNIQUE `(key)` | Key-value lookup |
| `pengumuman_penerima` | UNIQUE `(pengumuman_id, user_id)` | Cegah duplikasi penerima |
| `jurnal`, `izin_sakit`, `kunjungan_monitoring` | `(penempatan_pkl_id, tanggal)` (non-unique) | Query rekap per bulan/periode |

---

## 4. Kebijakan Cascade Ringkas

| Relasi | ON DELETE | Alasan |
|---|---|---|
| `kelas → jurusan` | CASCADE | Kelas tidak relevan tanpa jurusan induk |
| `murid/guru → users` | CASCADE | Profil tidak relevan tanpa akun |
| `pembimbing_industri → dudi` | CASCADE | Pembimbing terikat mutlak ke satu DUDI |
| `penempatan_pkl → murid/dudi/guru/tahun_ajaran` | CASCADE | Penempatan tidak valid tanpa keempat entitas ini |
| `penempatan_pkl → pembimbing_industri` | **SET NULL** | Penempatan tetap valid meski pembimbing industri belum/tidak diisi (sesuai desain null-safe rapor) |
| `presensi/izin_sakit/jurnal/kunjungan/penilaian → penempatan_pkl` | CASCADE | Data operasional tidak relevan tanpa penempatan induknya |
| `izin_sakit.approved_by / jurnal.verified_by → guru` | SET NULL | Riwayat pengajuan tetap ada meski akun guru penyetuju dihapus |
| `audit_logs.user_id → users` | SET NULL | Log tetap ada sebagai jejak historis meski user dihapus |

---

## 5. Soft Delete

Kolom `deleted_at` dipertahankan di seluruh tabel master + operasional inti (`users`, `jurusan`, `kelas`, `guru`, `murid`, `dudi`, `pembimbing_industri`, `penempatan_pkl`). Prisma tidak punya soft-delete built-in — **wajib** difilter eksplisit (`where: { deletedAt: null }`) di setiap query Service, atau dibungkus lewat Prisma Client Extension global agar tidak lupa di salah satu modul.

Tabel log/transaksional murni (`presensi`, `audit_logs`, `pengumuman_penerima`) **tidak** memakai soft-delete — dianggap immutable record.
