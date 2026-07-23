# PKLku — Backend API Service (NestJS)

Layanan backend REST API untuk sistem **PKLku**, dibangun dengan NestJS, Prisma ORM, dan PostgreSQL.

## Fitur Utama Backend:
- Autentikasi JWT (Access + Refresh Token Cookie) & Role-Based Access Control (`admin`, `guru`, `murid`).
- Presensi Digital Geofence Haversine Server-side & Watermark Selfie via `sharp`.
- Manajemen Master Data (DUDI, Guru, Murid, Jurusan, Kelas, Tahun Ajaran).
- Modul Jurnal Harian Siswa & Verifikasi Guru.
- Modul Pengajuan Izin/Sakit Siswa & Approval Guru.
- Modul Penilaian Kompetensi & Generate Rapor PDF A4 via **Puppeteer** + **EJS**.

## Perintah Pengembangan:
```bash
# Jalankan server development
pnpm run start:dev

# Migrasi database Prisma
pnpm run prisma migrate dev

# Seed database demo
pnpm run prisma db seed

# Build produksi
pnpm run build
```
