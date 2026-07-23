# Architecture.md — PKLku (Final)

## 1. Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Backend Framework | **NestJS** (Node.js ≥ 20 LTS, TypeScript strict) | Struktur modular built-in, DI, cocok mempertahankan pola "Modular Monolith" dari desain awal |
| ORM | **Prisma** | Type-safe query, migration tool bawaan, DX terbaik untuk PostgreSQL |
| Database | **PostgreSQL 16** | Native enum, JSONB, siap dikembangkan ke PostGIS bila perlu, cocok untuk self-hosted VPS |
| Auth | **Passport-JWT** (access + refresh token) | Stateless, mudah di-scale horizontal |
| Frontend Framework | **React 18 + Vite** | SPA cepat, ekosistem besar |
| Styling | **TailwindCSS + shadcn/ui** | Konsisten, komponen accessible by default, mudah dikustomisasi tanpa CSS override yang berantakan |
| State Management | **Redux Toolkit** (+ RTK Query untuk data-fetching) | Predictable state, cocok untuk banyak role dengan data kompleks (presensi real-time, form panjang) |
| Peta | **Leaflet.js** via `react-leaflet` | Ringan, open-source, cukup untuk geofencing & titik lokasi |
| PDF | **Puppeteer** | Render HTML/CSS sungguhan → PDF, lebih fleksibel dari Dompdf, cocok untuk rapor kompleks |
| Excel | **exceljs** | Ekspor/impor `.xlsx` dengan kontrol layout penuh (pivot-date) |
| Image processing | **sharp** | Native binding, jauh lebih cepat dari GD/Imagick untuk compress + watermark |
| File upload | **Multer** | Standar Express/NestJS, terintegrasi validasi mimetype |
| Containerization | **Docker + Docker Compose** | Portabilitas VPS, isolasi service |
| Reverse Proxy / SSL | **Nginx + Certbot (Let's Encrypt)** | Terminasi SSL, serving static build, routing `/api` |
| CI/CD | **GitHub Actions** → build image → deploy ke VPS via SSH | Otomatisasi tanpa perlu platform berbayar |

---

## 2. Prinsip Arsitektur

1. **API-first**: backend tidak pernah render HTML untuk end-user (kecuali template internal untuk Puppeteer). Semua komunikasi FE↔BE lewat REST JSON.
2. **Modular Monolith, bukan Microservices**: satu proses NestJS, dipecah rapi per modul domain. Microservices tidak sepadan untuk skala SMK (kompleksitas ops tidak worth it).
3. **Stateless backend**: tidak ada session server-side; state otentikasi sepenuhnya di JWT, sehingga API bisa di-scale ke banyak instance tanpa sticky session.
4. **Validasi kritikal selalu di server**: koordinat geofence, role/permission, dan perhitungan nilai tidak pernah dipercaya dari input client.
5. **File sebagai side-effect, bukan sumber kebenaran utama**: path file disimpan di DB, file fisik di volume terpisah — DB tetap sumber kebenaran metadata.

---

## 3. Struktur Folder (Monorepo)

```
pklku/
├── apps/
│   ├── api/                              # NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── master-data/          # tahun-ajaran, jurusan, kelas, dudi, pembimbing-industri
│   │   │   │   ├── penempatan/
│   │   │   │   ├── presensi/
│   │   │   │   ├── izin-sakit/
│   │   │   │   ├── jurnal/
│   │   │   │   ├── kunjungan/
│   │   │   │   ├── penilaian/            # + generate rapor PDF
│   │   │   │   ├── laporan/              # ekspor Excel
│   │   │   │   ├── pengumuman/
│   │   │   │   ├── settings/
│   │   │   │   └── audit-log/
│   │   │   ├── common/
│   │   │   │   ├── guards/               # JwtAuthGuard, RolesGuard
│   │   │   │   ├── decorators/           # @Roles(), @CurrentUser()
│   │   │   │   ├── interceptors/         # AuditLogInterceptor
│   │   │   │   ├── pipes/
│   │   │   │   └── utils/                # haversine.util.ts, image.util.ts
│   │   │   ├── templates/                # HTML/EJS template untuk Puppeteer (rapor, rekap kunjungan)
│   │   │   ├── prisma/                   # PrismaService (global module)
│   │   │   ├── config/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── uploads/                      # (mounted volume, bukan bagian dari image)
│   │   ├── test/
│   │   └── Dockerfile
│   │
│   └── web/                              # React SPA
│       ├── src/
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   ├── presensi/             # halaman + kamera + geofence check UI
│       │   │   ├── jurnal/
│       │   │   ├── izin-sakit/
│       │   │   ├── kunjungan/
│       │   │   ├── penilaian/
│       │   │   ├── laporan/
│       │   │   ├── master-data/
│       │   │   └── settings/
│       │   ├── components/ui/            # shadcn/ui primitives (button, card, dialog, dst)
│       │   ├── components/shared/        # komponen lintas fitur (DataTable, StatusBadge, dll)
│       │   ├── layouts/
│       │   │   ├── AdminLayout.tsx
│       │   │   ├── GuruLayout.tsx
│       │   │   └── MuridLayout.tsx       # tidak ada DudiLayout — DUDI tanpa login
│       │   ├── stores/                   # Redux Toolkit slices + RTK Query api slices
│       │   ├── lib/
│       │   │   ├── api-client.ts         # axios instance + refresh-token interceptor
│       │   │   └── haversine.ts          # dipakai untuk preview jarak di FE (bukan validasi final)
│       │   ├── routes/                   # route guard per role
│       │   └── main.tsx
│       ├── Dockerfile
│       └── nginx.conf
│
├── packages/
│   └── shared-types/                     # DTO/enum yang di-share api & web
│
├── nginx/
│   └── conf.d/pklku.conf
├── docker-compose.yml
├── docker-compose.prod.yml
└── .github/workflows/deploy.yml
```

---

## 4. Flow Data Antar Service

### 4.1. Flow Umum Request (semua fitur CRUD standar)

```
[React SPA]
   │  1. User berinteraksi (misal: submit form jurnal)
   ▼
[RTK Query mutation] ── attach JWT access token (Authorization header)
   ▼
[Nginx] ── reverse proxy /api/* ke container api:3000
   ▼
[NestJS Controller] ── validasi DTO (class-validator)
   ▼
[JwtAuthGuard → RolesGuard] ── cek token valid + role diizinkan
   ▼
[Service Layer] ── business logic + data scoping (misal: guru hanya boleh
   │                akses murid bimbingannya)
   ▼
[Prisma Client] ── query ke PostgreSQL
   ▼
[PostgreSQL] ── return data
   ▼
Response JSON ── kembali ke FE ── Redux store ter-update ── UI re-render
```

### 4.2. Flow Presensi (paling kritikal — melibatkan file + validasi lokasi)

```
[Murid buka halaman Presensi di HP]
   │
   ├─ 1. Browser minta izin GPS (Geolocation API) + Kamera (getUserMedia)
   ├─ 2. Preview kamera di-mirror (CSS scaleX(-1)) untuk kenyamanan
   ├─ 3. Siswa ambil foto → di-flip balik ke orientasi asli via canvas SEBELUM upload
   ▼
[POST /api/presensi/checkin] (multipart/form-data: foto + latitude + longitude)
   ▼
[Multer] ── validasi mimetype (tolak selain jpg/jpeg/png), size limit
   ▼
[PresensiService]
   ├─ a. Ambil penempatan_pkl aktif milik murid ini + data DUDI terkait
   ├─ b. Hitung Haversine(lokasi_murid, lokasi_dudi) — SERVER SIDE, wajib
   ├─ c. Jika di luar radius → 403 Forbidden, foto TIDAK disimpan
   ├─ d. Jika dalam radius → cek hari kerja DUDI, cek belum presensi hari ini
   ├─ e. sharp: resize max-width 640px + watermark (waktu, nama, DUDI, koordinat)
   ├─ f. Simpan file ke /app/uploads/presensi/ (volume persist)
   └─ g. Insert/update row `presensi` (status tepat_waktu/terlambat)
   ▼
Response ── FE tampilkan konfirmasi + update status presensi hari ini
```

### 4.3. Flow Generate Rapor PDF

```
[Guru klik "Cetak Rapor" pada siswa tertentu]
   ▼
[GET /api/penilaian/:penempatanId/rapor-pdf]
   ▼
[PenilaianService]
   ├─ 1. Query penempatan + relasi (murid, kelas, dudi, guru, pembimbing_industri,
   │      penilaian, keterangan_tp_json) — SEMUA relasi diakses dengan optional
   │      chaining agar null-safe jika pembimbing_industri belum di-plot
   ├─ 2. Render template EJS (templates/rapor.ejs) dengan data di atas
   ▼
[Puppeteer]
   ├─ 3. Launch headless Chromium, page.setContent(htmlString)
   ├─ 4. page.pdf({ format: 'A4' })
   └─ 5. browser.close() di blok finally (WAJIB — cegah memory leak di VPS)
   ▼
Response ── stream PDF ke browser (Content-Type: application/pdf)
```

### 4.4. Flow Autentikasi (JWT Access + Refresh)

```
[Login] → POST /api/auth/login
   ├─ Validasi email+password (bcrypt compare)
   ├─ Generate accessToken (15 menit) + refreshToken (7 hari)
   ├─ Hash refreshToken, simpan di kolom users.refresh_token_hash
   └─ Response: accessToken (body) + refreshToken (httpOnly cookie)

[Setiap request terproteksi]
   ├─ Axios interceptor attach accessToken di header
   ├─ Jika response 401 (token expired):
   │     → panggil POST /api/auth/refresh (refreshToken dari cookie)
   │     → dapat accessToken baru → retry request original
   └─ Jika refresh juga gagal → redirect ke halaman login

[Logout] → POST /api/auth/logout → hapus refresh_token_hash di DB → clear cookie
```

### 4.5. Flow Deployment (CI/CD)

```
[git push ke branch main]
   ▼
[GitHub Actions]
   ├─ 1. Run test (unit + e2e) — gagal → pipeline stop
   ├─ 2. Build image Docker (api, web)
   ├─ 3. Push image ke GHCR
   ▼
[SSH ke VPS]
   ├─ 4. docker compose pull
   ├─ 5. npx prisma migrate deploy   (job terpisah, terkontrol — bukan otomatis)
   └─ 6. docker compose up -d --no-deps --build <service>
```

---

## 5. Diagram Deployment (Docker Compose, Production)

```
                        ┌──────────────────────────┐
 Internet ── HTTPS ──▶  │      Nginx (container)    │
                        │  - SSL termination         │
                        │  - serve React static build│
                        │  - reverse proxy /api → api│
                        │  - serve /uploads (static) │
                        └───────────┬───────────────┘
                                    │ internal docker network
                     ┌──────────────┼───────────────┐
                     ▼                              ▼
           ┌──────────────────┐          ┌────────────────────┐
           │  api (NestJS)     │──────▶  │  postgres (16)       │
           │  container         │          │  container           │
           └──────────────────┘          └────────────────────┘
                     │
                     ▼
           ┌──────────────────┐
           │ uploads (volume)  │  ← persist antar redeploy
           └──────────────────┘
```

---

## 6. Environment & Konfigurasi

| Variable | Digunakan di | Keterangan |
|---|---|---|
| `DATABASE_URL` | api | Connection string PostgreSQL |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | api | Secret signing token |
| `FRONTEND_URL` | api | Untuk whitelist CORS |
| `VITE_API_BASE_URL` | web (build-time) | Base URL API yang dipanggil axios |
| `POSTGRES_USER/PASSWORD/DB` | postgres, api | Kredensial database |

Semua secret disuntikkan via environment variable VPS/Docker, **tidak pernah** ikut ter-commit atau ter-bake ke dalam image.
