# PKLku — Frontend Single Page Application (React + Vite)

Aplikasi web Single Page Application (SPA) untuk sistem **PKLku**, dibangun dengan React 18, Vite, TailwindCSS, dan shadcn/ui.

## Fitur Utama Frontend:
- **Mobile-First Student Interface**: Bottom tab bar navigasi jempol-friendly (`Home`, `Presensi`, `Jurnal`, `Izin`).
- **Real-Time Camera & GPS Selfie**: Penangkapan foto selfie dengan indikator jarak GPS real-time ke lokasi DUDI (`CameraCapture.tsx`).
- **Quick Login Demo**: Tombol masuk cepat untuk role Admin, Guru, dan Murid pada halaman Login.
- **Admin & Guru Portals**: Dashboard monitoring presensi real-time, kelola DUDI, verifikasi jurnal & izin.

## Perintah Pengembangan:
```bash
# Jalankan dev server Vite
pnpm run dev

# Build produksi
pnpm run build
```
