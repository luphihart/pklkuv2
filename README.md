# PKLku — Sistem Informasi Manajemen PKL/Magang SMK

**PKLku** adalah Sistem Informasi Manajemen berbasis web terintegrasi untuk mendigitalisasi seluruh siklus operasional program Praktek Kerja Lapangan (PKL) / Magang di SMK — mulai dari penempatan siswa, presensi berbasis lokasi (geofencing) + foto selfie, logbook jurnal harian, pengajuan izin/sakit, hingga penilaian kompetensi dan pencetakan rapor PDF.

---

## 📊 Status Progres Pengembangan

### ✅ Fitur yang Sudah Selesai (Completed):

1. **Infrastruktur Monorepo & Pnpm Workspace**:
   - Struktur monorepo `apps/api` (NestJS), `apps/web` (React/Vite), dan `packages/shared-types`.
   - Paket tipe bersama `@pklku/shared-types` (Enums `Role`, `StatusPenempatan`, `StatusPresensiMasuk`, `StatusApproval`, `TipeIzin`, DTO Interfaces).

2. **Basis Data & Skema Prisma (PostgreSQL 20 Tabel)**:
   - Skema lengkap sesuai `Schema.md` (Users, Guru, Murid, DUDI, Pembimbing Industri, Penempatan PKL, Presensi, Jurnal, Izin/Sakit, Kunjungan, Penilaian PKL, Pengumuman, Settings, Audit Logs).
   - Seed data otomatis (`apps/api/prisma/seed.ts`) dengan akun demo (Admin, Guru, Murid), DUDI demo, dan penempatan aktif.

3. **Modul Backend REST API (NestJS)**:
   - **Auth**: Autentikasi JWT (Access 15m + Refresh 7d), cookie httpOnly, RBAC (`@Roles()`, `@CurrentUser()`).
   - **Presensi**: Validasi geofence Haversine server-side (radius DUDI), verifikasi hari kerja, pencegahan absen ganda, dan kompresi + watermark lokasi & timestamp pada foto selfie (`sharp`).
   - **Master Data**: Endpoint DUDI (lat/lng/radius), Guru, dan Murid.
   - **Jurnal Harian**: Pengajuan jurnal harian siswa, filter status, dan verifikasi/penolakan guru (termasuk pencatatan konfirmasi DUDI).
   - **Izin / Sakit**: Pengajuan perizinan siswa dengan lampiran surat dan approval guru.
   - **Penilaian & Rapor PDF**: Upsert nilai kompetensi (40% Sekolah + 60% Industri) dan generate dokumen Rapor PDF A4 *headless* via **Puppeteer** + template HTML **EJS** (`rapor.ejs`).

4. **Frontend SPA React + Vite + TailwindCSS + shadcn/ui**:
   - **Auth**: Halaman Login (`LoginPage.tsx`) dengan tombol quick-login demo.
   - **Siswa (Mobile-First)**: Layout navigasi bawah (`MuridLayout.tsx`), komponen kamera selfie real-time GPS (`CameraCapture.tsx`), Dashboard Siswa (`MuridDashboard.tsx`), Presensi (`PresensiPage.tsx`), Jurnal (`JurnalPage.tsx`), dan Izin (`IzinPage.tsx`).
   - **Admin Portal**: Sidebar layout (`AdminLayout.tsx`), Dashboard monitoring (`AdminDashboard.tsx`), dan Kelola DUDI (`DudiListPage.tsx`).
   - **Guru Portal**: Sidebar layout (`GuruLayout.tsx`) dan Dashboard pemantauan siswa bimbingan (`GuruDashboard.tsx`).

---

### 🚀 Fitur yang Akan Datang (Upcoming Roadmap):

1. **Plotting Wizard Penempatan PKL (Admin)**:
   - Form *Stepper* 4 langkah untuk menghubungkan Murid ↔ DUDI ↔ Guru ↔ Pembimbing Industri dengan pencarian searchable `Combobox`.
2. **Panel Verifikasi Guru dengan Slide-Over Sheet**:
   - Panel *slide-in* cepat untuk Guru menyetujui/menolak jurnal & izin siswa tanpa perlu berpindah halaman.
3. **Kunjungan Monitoring Guru Pembimbing**:
   - Log kunjungan tatap muka guru ke lokasi DUDI (foto bukti + titik GPS) dan ekspor PDF rekap kunjungan.
4. **Pusat Laporan & Ekspor Excel (.xlsx)**:
   - Ekspor rekap presensi dan jurnal per rentang tanggal (harian, mingguan, bulanan) menggunakan `exceljs`.
5. **Pengumuman & Audit Log**:
   - Pengiriman pengumuman dari Admin ke role lain dan pelacakan aktivitas sensitif sistem.

---

## 🛠️ Panduan Menjalankan di Lokal (Local Setup)

### Prasyarat:
- **Node.js**: `v20.x` LTS atau lebih baru
- **pnpm**: `v9.x` / `v10.x` / `v11.x` (`npm install -g pnpm`)
- **PostgreSQL**: Server PostgreSQL aktif pada port `5432` / `54320`

### Langkah-langkah:

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/luphihart/pklkuv2.git
   cd pklkuv2
   ```

2. **Install Dependensi Workspace**:
   ```bash
   pnpm install
   ```

3. **Konfigurasi Environment Backend**:
   Salin `.env.example` ke `.env` pada folder `apps/api`:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   Sesuaikan `DATABASE_URL` dengan kredensial PostgreSQL Anda:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/pklku?schema=public"
   JWT_ACCESS_SECRET="super-secret-access-key-pklku-2026"
   JWT_REFRESH_SECRET="super-secret-refresh-key-pklku-2026"
   PORT=3000
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Migrasi Database & Seed Data Demo**:
   ```bash
   pnpm run db:migrate --name init
   pnpm run db:seed
   ```

5. **Jalankan Aplikasi Development**:
   ```bash
   # Jalankan backend API (port 3000) dan frontend Web (port 5173) bersamaan:
   pnpm --filter api run start:dev
   pnpm --filter web run dev
   ```

---

## 🔑 Kredensial Akun Demo (Seed Data)

| Role | Email | Password | Keterangan |
|---|---|---|---|
| **Admin** | `admin@smk.sch.id` | `password123` | Akses penuh manajemen master data & sistem |
| **Guru Pembimbing** | `guru1@smk.sch.id` | `password123` | Budi Santoso, S.Kom. (Monitoring & Penilaian) |
| **Siswa PKL** | `siswa1@smk.sch.id` | `password123` | Ahmad Fauzi (Siswa aktif di PT Teknologi Nusantara) |

---

## 📁 Struktur Monorepo

```
pklku/
├── apps/
│   ├── api/                              # NestJS backend REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma             # Skema 20 tabel PostgreSQL
│   │   │   └── seed.ts                   # Script seed data demo
│   │   └── src/
│   │       ├── modules/                  # Auth, Presensi, Master Data, Jurnal, Izin, Penilaian
│   │       ├── common/                   # Guards, Decorators, Utils (Haversine, Sharp)
│   │       └── templates/                # Template HTML/EJS (Rapor PDF)
│   │
│   └── web/                              # React SPA (Vite + TailwindCSS + shadcn/ui)
│       └── src/
│           ├── components/               # StatusBadge, CameraCapture, Shared UI
│           ├── features/                 # Auth, Dashboard, Presensi, Jurnal, Izin, Master Data
│           └── layouts/                  # AdminLayout, GuruLayout, MuridLayout (Mobile bottom nav)
│
├── packages/
│   └── shared-types/                     # Paket tipe & enum TypeScript bersama
│
├── Architecture.md                       # Dokumentasi Arsitektur
├── Design.md                             # Dokumentasi Design System & UI/UX
├── PRD.md                                # Product Requirement Document (PRD)
├── Rules.md                              # Coding Conventions & Git Guidelines
└── Schema.md                             # Dokumentasi Skema Basis Data
```

---

## 📜 Lisensi & Pengembang

Dikembangkan oleh **luphihart** untuk digitalisasi operasional PKL / Magang SMK di Indonesia.
