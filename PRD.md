# PRD.md — PKLku (Final)

## 1. Overview

**PKLku** adalah Sistem Informasi Manajemen berbasis web untuk mendigitalisasi seluruh siklus operasional program Praktek Kerja Lapangan (PKL)/Magang di SMK — mulai dari penempatan siswa, presensi berbasis lokasi, logbook harian, perizinan, kunjungan pembimbing, hingga penilaian akhir dan rapor.

**Perubahan penting terhadap desain sebelumnya**: **Pembimbing Industri (DUDI) tidak memiliki akun login.** Data profil pembimbing industri (nama, kontak, email) diinput oleh **Admin** atau **Guru Pembimbing**. Implikasinya terhadap fungsi yang sebelumnya dilakukan langsung oleh DUDI (verifikasi jurnal, input nilai industri) dijelaskan di §4.4.

---

## 2. Problem Statement

Proses PKL di SMK pada umumnya masih manual: presensi kertas/WhatsApp yang mudah dimanipulasi, jurnal kegiatan yang telat direkap, guru pembimbing kesulitan memantau puluhan siswa yang tersebar di banyak lokasi industri, dan penyusunan nilai/rapor akhir yang memakan waktu karena data tercecer. PKLku menyatukan seluruh proses ini dalam satu sistem yang **real-time**, **terverifikasi lokasi**, dan **auditable**.

---

## 3. Goals & Objectives

| Goal | Deskripsi | Indikator |
|---|---|---|
| G1 — Presensi anti-manipulasi | Presensi hanya sah jika siswa benar-benar berada di lokasi DUDI | Validasi geofence server-side, tidak ada presensi tanpa GPS+foto |
| G2 — Visibilitas real-time | Guru dapat memantau kehadiran & progres siswa bimbingan tanpa perlu bertanya manual | Peta interaktif + rekap kehadiran ter-update otomatis |
| G3 — Alur approval terstruktur | Semua pengajuan (izin, jurnal) punya jejak keputusan yang jelas | Setiap entri memiliki status + siapa yang memutuskan + kapan |
| G4 — Penilaian & rapor tanpa entri ulang | Nilai akhir dan rapor PDF dihasilkan dari data yang sudah ada di sistem | Rapor bisa digenerate 1-klik, null-safe |
| G5 — Operasional tanpa DUDI login | Sistem tetap berjalan penuh meski DUDI tidak pernah mengakses aplikasi | Semua data & keputusan terkait DUDI bisa diinput lewat akun Admin/Guru |

---

## 4. Scope

### 4.1. In-Scope (MVP)
- Autentikasi & RBAC untuk 3 role: **Admin, Guru, Murid** (bukan 4 — DUDI dihapus dari daftar role berlogin)
- Manajemen data master: Tahun Ajaran, Jurusan, Kelas, Guru, Murid, DUDI, Pembimbing Industri
- Plotting penempatan PKL (Murid ↔ DUDI ↔ Guru ↔ Pembimbing Industri)
- Presensi Check-in/Check-out: GPS Geofencing (Haversine server-side) + selfie kamera + kompresi + watermark
- Pengajuan & approval Izin/Sakit (lampiran foto wajib, guru sebagai approver)
- Jurnal Harian siswa dengan status verifikasi
- Kunjungan Guru Pembimbing ke DUDI (log + foto bukti + ekspor PDF rekap)
- Penilaian PKL berbasis Tujuan Pembelajaran (TP) & indikator, kombinasi skor sekolah + industri
- Rapor PDF A4 per siswa (generate via Puppeteer, null-safe)
- Pusat Laporan: ekspor Excel harian/mingguan/bulanan/kustom (pivot tanggal)
- Pengumuman dari Admin ke role lain
- Audit log aktivitas sensitif
- Pengaturan sistem (branding, jam operasional, radius geofence, bobot nilai) via halaman Settings

### 4.2. Out-of-Scope (MVP) — kandidat Fase 2+
- Login/portal khusus DUDI (magic link tanpa password, atau akun penuh)
- Notifikasi push/WhatsApp/email otomatis
- Aplikasi mobile native (MVP tetap web responsif, mobile-first untuk presensi)
- Multi-sekolah / multi-tenant dalam satu instance
- Integrasi dengan Dapodik/sistem akademik eksternal

### 4.3. MVP Definition — Must Have vs Nice to Have

**Must Have (tidak bisa rilis tanpa ini):**
1. Auth + RBAC 3 role
2. Master data + plotting penempatan
3. Presensi geofence + selfie (fitur inti produk)
4. Jurnal harian + approval
5. Izin/sakit + approval
6. Penilaian + rapor PDF
7. Audit log untuk aksi destruktif (khususnya hapus nilai, reset data)

**Nice to Have (boleh menyusul setelah rilis awal):**
- Kunjungan monitoring + ekspor PDF rekap
- Pusat laporan Excel pivot-date lengkap (versi awal cukup ekspor harian)
- Pengumuman
- Kustomisasi branding penuh (logo, kop surat)

### 4.4. Keputusan Desain: DUDI Tanpa Login

Karena Pembimbing Industri tidak memiliki akun, tiga fungsi yang sebelumnya melekat pada role DUDI dialihkan sebagai berikut:

| Fungsi lama (role DUDI) | Penanganan baru |
|---|---|
| Verifikasi/koreksi Jurnal Harian | **Guru Pembimbing** menginput status verifikasi jurnal, dengan opsi mencatat bahwa keputusan berdasarkan koordinasi dengan pembimbing industri (field `catatan_verifikasi` dipakai untuk mencatat "dikonfirmasi oleh [nama pembimbing industri] via [telepon/WA/kunjungan]") |
| Input nilai kompetensi aspek industri | **Guru Pembimbing** (atau **Admin**) menginput `nilai_industri_json` atas nama pembimbing industri, idealnya berdasarkan formulir fisik/lembar penilaian dari DUDI yang diserahkan ke sekolah |
| Memantau kehadiran & logbook siswa | Dihilangkan dari MVP — DUDI memantau secara langsung di lokasi (tatap muka), bukan lewat sistem |

> **Catatan produk**: opsi jangka panjang yang direkomendasikan untuk Fase 2 adalah **tokenized public link** — DUDI menerima tautan unik per siswa (tanpa perlu akun/password) untuk mengisi form penilaian/verifikasi sendiri. Ini menghindari beban input ganda ke Guru tanpa perlu membangun sistem auth penuh untuk DUDI. Tidak termasuk MVP saat ini.

---

## 5. Technical Requirements

### 5.1. Functional Requirements (ringkas — detail lihat Architecture.md & Schema.md)
- Backend REST API (NestJS) dikonsumsi oleh SPA React terpisah
- Semua endpoint memvalidasi input via DTO (`class-validator`)
- Presensi memvalidasi jarak GPS di server, bukan client
- Semua foto (presensi, izin, jurnal, kunjungan) dikompresi otomatis sebelum disimpan
- Rapor & rekap kunjungan digenerate sebagai PDF via Puppeteer
- Ekspor data tabular sebagai `.xlsx` via `exceljs`

### 5.2. Non-Functional Requirements
| Kategori | Requirement |
|---|---|
| **Performance** | Endpoint list/report umum merespons < 500ms pada dataset hingga ~2.000 siswa aktif; generate PDF rapor < 5 detik per dokumen |
| **Availability** | Target uptime 99% (wajar untuk skala SMK single-VPS, bukan SLA enterprise) |
| **Security** | JWT access+refresh, RBAC ketat, rate limiting endpoint presensi/login, validasi mimetype file, HTTPS wajib di production |
| **Scalability** | Backend & frontend containerized terpisah agar bisa di-scale horizontal jika dibutuhkan (misal saat jam presensi puncak) |
| **Data Integrity** | Foreign key constraint penuh, soft-delete untuk data historis penting (presensi/nilai tidak pernah hard-delete kecuali eksplisit oleh Admin) |
| **Auditability** | Semua aksi destruktif (hapus nilai, hapus penempatan, reset) tercatat di `audit_logs` dengan IP + user agent |
| **Compatibility** | Responsif di Chrome/Safari/Edge versi 2 tahun terakhir; mobile-first untuk halaman presensi (kamera + GPS wajib berfungsi di browser mobile) |

---

## 6. Success Metrics

| Metrik | Target MVP | Cara Ukur |
|---|---|---|
| Adopsi presensi digital | ≥ 90% siswa aktif melakukan check-in digital dalam 2 minggu pertama rilis | Query jumlah `presensi` unik per hari / jumlah `penempatan_pkl` aktif |
| Akurasi geofence | 0% presensi tervalidasi di luar radius (by design — server-enforced) | Audit log tidak menunjukkan bypass |
| Waktu approval izin/jurnal | Rata-rata < 24 jam dari pengajuan ke keputusan guru | Selisih `created_at` pengajuan vs `updated_at` status |
| Waktu generate rapor | < 5 detik per siswa, 0 error null-reference pada data DUDI kosong | Log error backend saat endpoint rapor dipanggil |
| Ekspor laporan digunakan | Admin/Guru mengekspor laporan Excel minimal 1x per bulan per sekolah aktif | Log pemanggilan endpoint `laporan/export` |
| Downtime tak terjadwal | < 3 insiden per bulan pasca stabil | Monitoring uptime VPS |
