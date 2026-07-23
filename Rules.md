# Rules.md — PKLku (Final)
## Coding Convention & Style Guide

---

## 1. Prinsip Umum

1. **Konsistensi lebih penting dari preferensi pribadi.** Ikuti pola yang sudah ada di codebase, jangan perkenalkan gaya baru tanpa diskusi.
2. **Logic isolation**: Controller tipis, business logic di Service, query kompleks boleh diekstrak ke method privat Service — tidak pernah langsung di Controller atau komponen React.
3. **Type-safety wajib**: `any` dilarang kecuali ada komentar `// TODO: <alasan>` menjelaskan kenapa terpaksa.
4. **Setiap PR wajib lulus test + lint** sebelum merge (lihat §6).

---

## 2. Struktur & Arsitektur (ringkas — detail di Architecture.md)
- Backend: Modular Monolith NestJS, satu folder `modules/<domain>/` per domain.
- Frontend: co-location per fitur di `features/<domain>/`, bukan dipisah per tipe file global.
- Tidak ada logic domain yang "menyebar" — kalau fitur X butuh data dari modul Y, inject Service Y, jangan duplikasi query.

---

## 3. Naming Conventions

### 3.1. Backend (TypeScript/NestJS)
| Elemen | Konvensi | Contoh |
|---|---|---|
| File | `kebab-case.type.ts` | `presensi.service.ts`, `checkin.dto.ts` |
| Class | `PascalCase` | `PresensiService`, `CheckinDto` |
| Interface/Type | `PascalCase`, tanpa prefix `I` | `AuthenticatedUser` (bukan `IAuthenticatedUser`) |
| Variabel/fungsi | `camelCase` | `getActivePenempatan()` |
| Konstanta global | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE`, `DEFAULT_BATAS_MASUK` |
| Enum Prisma | `PascalCase` untuk nama enum, `snake_case` untuk value (ikut DB) | `enum Role { admin, guru, murid }` |
| Endpoint REST | `kebab-case`, plural untuk resource | `/api/izin-sakit`, `/api/penempatan-pkl` |
| Module NestJS | Nama domain singular/plural sesuai konteks bisnis | `presensi` (bukan `presensis`) |

### 3.2. Frontend (React/TypeScript)
| Elemen | Konvensi | Contoh |
|---|---|---|
| Komponen file & nama | `PascalCase.tsx` | `CameraCapture.tsx`, `StatusBadge.tsx` |
| Hook kustom | `camelCase`, prefix `use` | `useGeolocation.ts`, `useCurrentUser.ts` |
| Redux slice file | `kebab-case.slice.ts` | `presensi.slice.ts` |
| Redux action/thunk | `camelCase`, verb-first | `submitCheckin`, `fetchPenempatanAktif` |
| CSS/Tailwind class custom (jarang, hindari) | `kebab-case` | `.camera-overlay` |
| Route path | `kebab-case` | `/izin-sakit`, `/master-data/dudi` |

### 3.3. Database (mengikuti Schema.md)
- Nama tabel: `snake_case`, plural untuk tabel data (`users`, `audit_logs`), singular untuk tabel domain PKL (`jurnal`, `presensi` — tetap ikuti konvensi asli agar konsisten dengan skema v1)
- Nama kolom: `snake_case`
- Nama constraint/index: `<table>_<column(s)>_<type>` contoh: `presensi_penempatan_pkl_id_tanggal_unique`

---

## 4. Style Guide Spesifik

### 4.1. Backend
- **DTO wajib untuk semua input**, divalidasi dengan `class-validator`. Jangan menerima `@Body() body: any`.
- **Response shape konsisten**: sukses mengembalikan data langsung (bukan dibungkus `{ success: true, data: ... }` kecuali endpoint list yang butuh metadata pagination — dalam hal itu bentuknya `{ data: [...], meta: { total, page, limit } }`).
- **Error handling**: gunakan exception bawaan NestJS (`BadRequestException`, `ForbiddenException`, `NotFoundException`, dst) — jangan `throw new Error()` generik, karena tidak menghasilkan HTTP status code yang tepat.
- **Async/await selalu**, hindari mixing `.then()` dengan `async/await` dalam satu fungsi.
- **Jangan expose field sensitif**: `password`, `refreshTokenHash` tidak pernah ikut ter-return ke client — gunakan `select` Prisma eksplisit atau mapping manual.
- **Komentar hanya untuk "kenapa", bukan "apa"**: kode yang jelas tidak butuh komentar `// ambil user by id` di atas `findUnique`. Komentar penting untuk keputusan non-obvious (contoh: kenapa Haversine dihitung ulang di server).

### 4.2. Frontend
- **Komponen fungsional + Hooks saja**, tidak ada class component.
- **Props wajib di-type eksplisit** lewat `interface Props { ... }`, tidak inline `React.FC<any>`.
- **RTK Query untuk semua data-fetching** dari API backend — hindari `useEffect` + `fetch` manual kecuali kasus sangat spesifik (misal streaming/WebSocket).
- **Redux slice hanya untuk state lintas komponen** (misal: `currentUser`, `cartOfPendingApprovals`). State lokal murni (misal: form input sebelum submit) cukup `useState`/`react-hook-form`, jangan taruh semua di Redux.
- **Tailwind utility-first**, hindari custom CSS kecuali untuk animasi/behavior yang tidak bisa dicapai lewat utility class.
- **Komponen shadcn/ui tidak dimodifikasi langsung di `components/ui/`** (folder itu hasil `npx shadcn add`) — kalau butuh varian baru, extend lewat props/className, atau buat wrapper component baru di `components/shared/`.

### 4.3. Penanganan File & Gambar (wajib, lihat juga Architecture.md §4.2)
- Semua upload foto **wajib** lewat service kompresi berbasis `sharp` sebelum disimpan — tidak ada jalur upload yang menyimpan file mentah.
- Validasi mimetype di `multer` `fileFilter`, jangan hanya mengandalkan ekstensi nama file.
- Foto presensi: mirror hanya di preview UI (CSS), file yang di-upload harus sudah di-flip ke orientasi asli di client (canvas) sebelum dikirim ke server.

### 4.4. Penanganan PDF (Puppeteer)
- Template disimpan sebagai file `.ejs` terpisah di `templates/`, tidak ditulis sebagai string HTML inline di dalam Service.
- Data yang dikirim ke template wajib sudah null-safe (`?.`/`??`) di level Service — template tidak melakukan null-check.
- `browser.close()` wajib dipanggil di blok `finally`.

### 4.5. Keamanan
- Setiap endpoint yang butuh login: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)` eksplisit — jangan andalkan default "semua role boleh" kecuali memang endpoint publik (`/auth/login`).
- Data scoping (guru hanya lihat murid bimbingannya) divalidasi di Service, **bukan** hanya di FE — FE hanya menyembunyikan UI, tidak menjamin keamanan.
- Tidak ada secret (API key, JWT secret, DB password) yang di-commit ke repo, termasuk di file contoh — gunakan placeholder di `.env.example`.

---

## 5. Git Workflow

### 5.1. Branch Naming
```
feature/<nama-fitur>       → feature/presensi-geofence
fix/<deskripsi-singkat>    → fix/rapor-null-pembimbing-industri
chore/<deskripsi>          → chore/update-dependencies
```

### 5.2. Commit Message — Conventional Commits
```
<type>(<scope>): <deskripsi singkat, present tense>

feat(presensi): tambah validasi geofence server-side
fix(penilaian): perbaiki null-reference saat pembimbing industri kosong
refactor(auth): pindahkan logic refresh token ke service terpisah
chore(deps): update prisma ke versi 5.19
docs(schema): perbarui dokumentasi tabel pembimbing_industri
test(presensi): tambah e2e test untuk checkin di luar radius
```
Type yang dipakai: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style` (format-only, tanpa perubahan logic).

### 5.3. Pull Request
- PR wajib menyertakan: deskripsi singkat perubahan, screenshot (untuk perubahan UI), checklist test yang sudah dijalankan.
- Minimal 1 review sebelum merge (kecuali proyek solo — tetap self-review sebelum merge).
- Squash merge ke `main` agar history bersih per-fitur.

---

## 6. Linting, Formatting & Testing

| Tool | Konfigurasi | Dijalankan |
|---|---|---|
| **ESLint** | `@typescript-eslint/recommended` + `eslint-plugin-react-hooks` (FE) | `pnpm lint`, wajib pass sebelum PR merge |
| **Prettier** | `singleQuote: true, semi: true, trailingComma: 'all', printWidth: 100` | Auto-format on save (disepakati tim), atau `pnpm format` |
| **Jest** | Unit test backend (service layer) | `pnpm test` |
| **Supertest + Jest** | E2E test endpoint kritikal | `pnpm test:e2e` |
| **Husky + lint-staged** | Pre-commit hook: lint + format file yang di-stage | Otomatis saat `git commit` |

**Prinsip No Regression**: semua test yang sudah ada wajib tetap PASS. Jika perubahan skema membuat test lama gagal, perbarui seed/factory terkait — jangan hapus test yang gagal begitu saja.

---

## 7. Environment & Konfigurasi
- `.env.example` wajib selalu up-to-date setiap kali ada environment variable baru ditambahkan.
- Tidak ada perbedaan kode antara development/production selain lewat environment variable (`NODE_ENV`, `DATABASE_URL`, dst) — jangan `if (isDev) { ... }` untuk logic bisnis, hanya untuk hal seperti logging verbosity.

---

## 8. Migrasi Database
- Gunakan `prisma migrate dev --name <deskripsi-jelas>` untuk migrasi baru di lokal.
- **Dilarang** mengedit file migrasi yang sudah pernah dijalankan di production — buat migrasi baru untuk perubahan lanjutan.
- Migrasi production dijalankan eksplisit (`prisma migrate deploy`) sebagai langkah terpisah dalam pipeline deploy, bukan otomatis saat container start.
- Backup (`pg_dump`) wajib dilakukan sebelum migrasi yang mengubah/menghapus kolom di production.

---

## 9. Dokumentasi
- Setiap modul baru wajib menambah baris di `README.md` root (daftar modul + status: done/in-progress/planned).
- Perubahan skema database wajib disinkronkan ke `Schema.md`.
- Perubahan besar pada alur (misal menambah role baru) wajib disinkronkan ke `PRD.md` dan `Architecture.md`.
