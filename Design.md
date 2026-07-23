# Design.md — PKLku (Final)
## Rombak Total UI/UX — Design System & Flow

---

## 1. Prinsip Desain

1. **Mobile-first untuk Murid, desktop-first untuk Admin/Guru.** Murid mengakses hampir seluruhnya lewat HP (presensi tiap hari), sementara Admin/Guru lebih banyak bekerja dengan tabel data & laporan di layar besar.
2. **Clarity over decoration.** Status (pending/disetujui/ditolak, tepat waktu/terlambat) harus terlihat sekilas lewat warna+label, bukan hanya teks.
3. **Zero ambiguous state.** Setiap aksi (submit presensi, ajukan izin) punya feedback jelas: loading, sukses, gagal dengan alasan spesifik (contoh: "Anda 340m dari lokasi DUDI" — bukan sekadar "Gagal").
4. **Konsisten lintas role.** Admin, Guru, dan Murid memakai bahasa visual yang sama (warna status, tipografi, komponen) — hanya layout/navigasi yang berbeda sesuai kebutuhan role.
5. **Aksesibel secara default.** Karena berbasis shadcn/ui (dibangun di atas Radix UI primitives), kontras warna, keyboard navigation, dan ARIA attributes sudah tertangani di tingkat komponen — bukan ditambal belakangan.

---

## 2. Design System

### 2.1. Typography
| Elemen | Font | Ukuran | Weight |
|---|---|---|---|
| Heading (H1–H2) | **Outfit** | 24–32px | 600–700 |
| Heading (H3–H4) / Sub-header | **Outfit** | 18–20px | 600 |
| Body text | **Inter** | 14–16px | 400 |
| Label / caption / meta | **Inter** | 12–13px | 500 |
| Angka besar (dashboard stat) | **Outfit** | 28–36px | 700 |

Outfit dipakai khusus untuk heading & angka statistik agar terasa modern/tegas; Inter untuk seluruh body text karena keterbacaan tinggi di ukuran kecil (tabel, form).

### 2.2. Warna (Design Tokens)

| Token | Hex (Light) | Penggunaan |
|---|---|---|
| `--primary` | `#2563EB` (blue-600) | Aksi utama, link, elemen aktif navigasi |
| `--primary-foreground` | `#FFFFFF` | Teks di atas primary |
| `--success` | `#16A34A` (green-600) | Status disetujui, tepat waktu, hadir |
| `--warning` | `#D97706` (amber-600) | Status pending, terlambat |
| `--destructive` | `#DC2626` (red-600) | Status ditolak, alfa, aksi hapus |
| `--muted` | `#F1F5F9` (slate-100) | Background section sekunder, table stripe |
| `--muted-foreground` | `#64748B` (slate-500) | Teks sekunder, placeholder |
| `--border` | `#E2E8F0` (slate-200) | Border card/input |
| `--background` | `#FFFFFF` | Background utama |
| `--foreground` | `#0F172A` (slate-900) | Teks utama |

> Implementasi: didefinisikan sebagai CSS variable di `index.css` sesuai konvensi shadcn/ui (`hsl(var(--primary))`), agar dark mode (opsional, fase 2) tinggal swap value token tanpa mengubah komponen.

### 2.3. Status Badge — Bahasa Visual Konsisten

Karena hampir semua modul (presensi, jurnal, izin, penilaian) punya konsep status, satu komponen `<StatusBadge>` dipakai di seluruh aplikasi dengan mapping tetap:

| Status | Warna Badge | Icon (lucide-react) |
|---|---|---|
| `pending` | amber (warning) | `Clock` |
| `disetujui` / `tepat_waktu` / `hadir` | green (success) | `CheckCircle2` |
| `ditolak` / `terlambat` | red (destructive) / amber | `XCircle` / `AlertTriangle` |
| `alfa` | red (destructive) | `AlertCircle` |
| `izin` / `sakit` | blue (info, token baru `--info: #0284C7`) | `FileText` |

### 2.4. Spacing & Layout Grid
- Skala spacing mengikuti Tailwind default (`4px` increment: `p-1`=4px … `p-8`=32px).
- Container max-width desktop: `1280px`, padding horizontal `24px`.
- Card radius: `rounded-xl` (12px) — konsisten di semua card/modal/input untuk kesan modern-soft.
- Grid dashboard: 12-column, breakpoint `sm/md/lg/xl` standar Tailwind.

### 2.5. Elevation
- Card default: `shadow-sm` + `border` tipis (bukan shadow tebal) — gaya flat-modern, bukan skeuomorphic.
- Modal/Dialog: `shadow-lg` untuk membedakan layer dari konten belakang.

---

## 3. Component Library (berbasis shadcn/ui)

| Komponen | Sumber | Kustomisasi Khusus PKLku |
|---|---|---|
| `Button` | shadcn `button` | Varian tambahan `success`/`warning` selain default/destructive/outline/ghost |
| `DataTable` | shadcn `table` + TanStack Table | Wrapper kustom dengan built-in search, filter status, pagination, export button |
| `StatusBadge` | Kustom (di atas shadcn `badge`) | Mapping warna tetap sesuai §2.3 |
| `Dialog` / `Sheet` | shadcn | `Sheet` (slide-in dari kanan) dipakai di mobile untuk form, `Dialog` (center modal) di desktop |
| `Form` | shadcn `form` + `react-hook-form` + `zod` | Validasi client-side selaras dengan DTO backend (skema `zod` idealnya digenerate dari struktur DTO yang sama) |
| `CameraCapture` | Kustom | Komponen khusus presensi: preview mirror, tombol shutter, indikator jarak GPS real-time sebelum submit |
| `MapPicker` / `MapViewer` | Kustom (react-leaflet) | `MapPicker` untuk Admin set titik DUDI, `MapViewer` untuk Guru pantau real-time |
| `Combobox` | shadcn `command` + `popover` | Dipakai untuk pilih Murid/DUDI/Guru di form plotting (searchable, dataset bisa ratusan) |
| `Toast` | shadcn `sonner` | Feedback aksi (sukses/gagal), termasuk pesan error presensi yang spesifik |
| `Skeleton` | shadcn | Loading state tabel/card, bukan spinner generik |
| `EmptyState` | Kustom | Ilustrasi + CTA saat data kosong (misal: "Belum ada jurnal minggu ini") |
| `Stepper` | Kustom | Alur multi-step seperti plotting penempatan (pilih murid → pilih DUDI → pilih guru → konfirmasi) |

---

## 4. Layout per Role

### 4.1. Admin & Guru — Desktop-first Dashboard Layout
```
┌───────────────────────────────────────────────────┐
│ Topbar: Logo Sekolah | Search global | Notif | Avatar │
├───────────┬─────────────────────────────────────────┤
│ Sidebar    │  Page Header (judul + breadcrumb + CTA)  │
│ (collapsible)                                          │
│ - Dashboard│  Content Area                             │
│ - Master   │  (DataTable / Form / Chart, per halaman)  │
│   Data     │                                            │
│ - Penempatan│                                           │
│ - Presensi │                                            │
│ - Jurnal   │                                            │
│ - Izin/Sakit│                                           │
│ - Kunjungan│  (khusus Guru)                             │
│ - Penilaian│                                            │
│ - Laporan  │                                            │
│ - Pengumuman│                                           │
│ - Settings │  (khusus Admin)                            │
└───────────┴─────────────────────────────────────────┘
```
- Sidebar collapsible ke icon-only di layar < 1280px.
- Menu yang tampil disaring sesuai role (Guru tidak melihat menu "Settings"/"Reset Database").

### 4.2. Murid — Mobile-first Layout
```
┌─────────────────────────┐
│ Topbar: Nama + Foto      │
├─────────────────────────┤
│                           │
│   Konten (1 fokus/layar) │
│                           │
├─────────────────────────┤
│ Bottom Nav (5 ikon):      │
│ Home | Presensi | Jurnal │
│ Izin | Profil             │
└─────────────────────────┘
```
- Navigasi bawah (bottom tab bar) khas aplikasi mobile — jempol-friendly, bukan hamburger menu.
- Halaman "Home" murid menampilkan: status presensi hari ini (kartu besar, warna sesuai status), progress kehadiran bulan ini, notifikasi jurnal/izin yang perlu direvisi.

### 4.3. Tidak Ada Layout DUDI
Karena Pembimbing Industri tidak login, tidak ada `DudiLayout`. Representasi DUDI di sistem murni sebagai **data** (dikelola lewat Admin/Guru), bukan sebagai user aplikasi.

---

## 5. UX Flow Kunci

### 5.1. Flow Presensi (Murid) — flow paling sering dipakai, harus tercepat
1. Buka app → tab "Presensi" (atau langsung dari kartu status di Home)
2. Sistem minta izin lokasi otomatis saat halaman dibuka (bukan menunggu klik)
3. Tampilkan jarak real-time ke DUDI ("Anda 32m dari kantor — dalam radius ✅" / "Anda 340m dari kantor — di luar radius ❌") **sebelum** siswa buka kamera, supaya tidak buang waktu ambil foto kalau memang di luar jangkauan
4. Kalau dalam radius → tombol "Ambil Foto Presensi" aktif
5. Buka kamera (preview di-mirror), siswa foto, preview hasil (sudah di-flip ke orientasi asli) dengan tombol "Ulangi" / "Kirim"
6. Klik Kirim → loading state singkat → toast sukses + kartu status di Home langsung berubah jadi "Sudah presensi masuk — 07:42 (Tepat Waktu)"
7. Error handling eksplisit: kalau ditolak server (di luar radius/hari libur/sudah presensi), tampilkan pesan spesifik, bukan generic error

### 5.2. Flow Approval (Guru) — Izin/Sakit & Jurnal
1. Guru buka menu "Izin/Sakit" atau "Jurnal" → default filter tab "Pending" (paling sering dibutuhkan)
2. List berupa card ringkas per pengajuan (nama murid, tanggal, ringkasan alasan, thumbnail foto lampiran)
3. Klik card → buka `Sheet` (slide-in panel, tidak pindah halaman) berisi detail lengkap + foto full-size + 2 tombol besar: **Setujui** (hijau) / **Tolak** (merah, wajib isi catatan)
4. Setelah aksi → card otomatis hilang dari list "Pending", toast konfirmasi, badge counter sidebar berkurang

### 5.3. Flow Plotting Penempatan (Admin) — form kompleks, dipandu step-by-step
1. `Stepper` 4 langkah: **Pilih Murid** → **Pilih DUDI** → **Pilih Guru & (opsional) Pembimbing Industri** → **Konfirmasi tanggal & simpan**
2. Tiap langkah pakai `Combobox` searchable (dataset besar), dengan info ringkas di kartu preview (misal setelah pilih DUDI, tampilkan radius & alamatnya)
3. Langkah terakhir menampilkan ringkasan penuh sebelum submit — mencegah kesalahan plotting yang baru ketahuan belakangan

### 5.4. Flow Penilaian & Rapor (Guru)
1. Halaman Penilaian per siswa: form terbagi 2 kolom — "Aspek Sekolah" (Guru isi) dan "Aspek Industri" (Guru isi atas nama DUDI, dengan catatan sumber data — lihat PRD §4.4)
2. Skor per indikator TP diinput lewat slider/number input dengan live-preview nilai rata-rata
3. Tombol "Cetak Rapor PDF" hanya aktif setelah kedua aspek terisi minimal sekali (indikator visual: progress bar "Kelengkapan Data Rapor")
4. Klik cetak → loading state (karena render Puppeteer perlu beberapa detik) → PDF terbuka di tab baru / auto-download

---

## 6. Responsiveness & Breakpoints

| Breakpoint | Lebar | Perilaku |
|---|---|---|
| Mobile | < 640px | Layout Murid penuh (bottom nav), Admin/Guru: sidebar auto-hidden jadi hamburger |
| Tablet | 640–1024px | Admin/Guru: sidebar collapsible icon-only, tabel scroll horizontal |
| Desktop | > 1024px | Layout penuh sesuai §4.1 |

---

## 7. Aksesibilitas
- Kontras warna teks minimal WCAG AA (dicek terhadap token di §2.2)
- Semua form input punya `<label>` terasosiasi (bukan hanya placeholder)
- Status disampaikan lewat warna **+** ikon **+** teks (tidak mengandalkan warna saja — penting untuk color-blind users, terutama status hijau/merah)
- Komponen interaktif (`CameraCapture`, `MapPicker`) tetap punya fallback teks/instruksi jelas jika permission browser (kamera/lokasi) ditolak

---

## 8. Yang Berubah Signifikan dari UI Lama (Bootstrap 5)
- Dari komponen Bootstrap generik → shadcn/ui yang lebih halus & konsisten secara visual (radius, shadow, spacing seragam)
- Dari full-page reload per aksi (Blade) → interaksi in-place (`Sheet`/`Dialog`/toast) tanpa reload, terasa lebih cepat
- Navigasi Murid berubah total dari sidebar desktop-style → bottom tab bar mobile-native
- Penambahan indikator jarak real-time sebelum ambil foto presensi (tidak ada di desain lama) — mengurangi friksi & foto sia-sia
