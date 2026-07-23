import { PrismaClient, Role, Semester, StatusTahunAjaran, StatusPenempatan, StatusMasuk, StatusPulang, StatusApproval, TipeIzin, TipeIndikator } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PKLku database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@smk.sch.id' },
    update: {},
    create: {
      name: 'Administrator Utama',
      email: 'admin@smk.sch.id',
      password: hashedPassword,
      role: Role.admin,
      phone: '081234567890',
    },
  });

  // 2. Teachers
  const guru1User = await prisma.user.upsert({
    where: { email: 'guru1@smk.sch.id' },
    update: {},
    create: {
      name: 'Budi Santoso, S.Kom.',
      email: 'guru1@smk.sch.id',
      password: hashedPassword,
      role: Role.guru,
      phone: '081298765432',
    },
  });

  const guru1 = await prisma.guru.upsert({
    where: { user_id: adminUser.id ? guru1User.id : guru1User.id },
    update: {},
    create: {
      user_id: guru1User.id,
      nip: '198501012010011001',
      nama: 'Budi Santoso, S.Kom.',
    },
  });

  const guru2User = await prisma.user.upsert({
    where: { email: 'guru2@smk.sch.id' },
    update: {},
    create: {
      name: 'Siti Rahma, M.T.',
      email: 'guru2@smk.sch.id',
      password: hashedPassword,
      role: Role.guru,
      phone: '081298765433',
    },
  });

  const guru2 = await prisma.guru.upsert({
    where: { user_id: guru2User.id },
    update: {},
    create: {
      user_id: guru2User.id,
      nip: '198803152012022002',
      nama: 'Siti Rahma, M.T.',
    },
  });

  // 3. Jurusan & Kelas
  const jurusanRpl = await prisma.jurusan.upsert({
    where: { kode: 'RPL' },
    update: {},
    create: {
      kode: 'RPL',
      nama: 'Rekayasa Perangkat Lunak',
      singkatan: 'RPL',
    },
  });

  const jurusanTkj = await prisma.jurusan.upsert({
    where: { kode: 'TKJ' },
    update: {},
    create: {
      kode: 'TKJ',
      nama: 'Teknik Komputer dan Jaringan',
      singkatan: 'TKJ',
    },
  });

  const kelasRpl1 = await prisma.kelas.create({
    data: {
      jurusan_id: jurusanRpl.id,
      nama: 'XII RPL 1',
    },
  });

  // 4. Students
  const murid1User = await prisma.user.upsert({
    where: { email: 'siswa1@smk.sch.id' },
    update: {},
    create: {
      name: 'Ahmad Fauzi',
      email: 'siswa1@smk.sch.id',
      password: hashedPassword,
      role: Role.murid,
      phone: '085612345678',
    },
  });

  const murid1 = await prisma.murid.upsert({
    where: { user_id: murid1User.id },
    update: {},
    create: {
      user_id: murid1User.id,
      kelas_id: kelasRpl1.id,
      nis: '2026001',
      nama: 'Ahmad Fauzi',
    },
  });

  const murid2User = await prisma.user.upsert({
    where: { email: 'siswa2@smk.sch.id' },
    update: {},
    create: {
      name: 'Bintang Pratama',
      email: 'siswa2@smk.sch.id',
      password: hashedPassword,
      role: Role.murid,
      phone: '085612345679',
    },
  });

  const murid2 = await prisma.murid.upsert({
    where: { user_id: murid2User.id },
    update: {},
    create: {
      user_id: murid2User.id,
      kelas_id: kelasRpl1.id,
      nis: '2026002',
      nama: 'Bintang Pratama',
    },
  });

  // 5. DUDI & Pembimbing Industri
  const dudi1 = await prisma.dudi.create({
    data: {
      nama: 'PT Teknologi Nusantara',
      alamat: 'Jl. Jendral Sudirman No. 45, Jakarta Selatan',
      latitude: -6.2088,
      longitude: 106.8456,
      radius_meter: 100,
      pic_nama: 'Hendra Wijaya',
      pic_phone: '081122334455',
      hari_kerja: 'Senin,Selasa,Rabu,Kamis,Jumat',
    },
  });

  const pembimbing1 = await prisma.pembimbingIndustri.create({
    data: {
      dudi_id: dudi1.id,
      nama: 'Hendra Wijaya',
      phone: '081122334455',
      email: 'hendra@teknus.co.id',
    },
  });

  // 6. Tahun Ajaran
  const ta2026 = await prisma.tahunAjaran.create({
    data: {
      tahun: '2025/2026',
      semester: Semester.ganjil,
      status: StatusTahunAjaran.aktif,
    },
  });

  // 7. Penempatan PKL
  const penempatan1 = await prisma.penempatanPkl.create({
    data: {
      murid_id: murid1.id,
      dudi_id: dudi1.id,
      guru_id: guru1.id,
      pembimbing_industri_id: pembimbing1.id,
      tahun_ajaran_id: ta2026.id,
      tanggal_mulai: new Date('2026-07-01'),
      tanggal_selesai: new Date('2026-12-31'),
      status: StatusPenempatan.aktif,
    },
  });

  // 8. Presensi Sample
  await prisma.presensi.create({
    data: {
      penempatan_pkl_id: penempatan1.id,
      tanggal: new Date('2026-07-23'),
      jam_masuk: new Date('2026-07-23T07:45:00'),
      jam_pulang: new Date('2026-07-23T16:00:00'),
      lat_masuk: -6.2088,
      lng_masuk: 106.8456,
      lat_pulang: -6.2088,
      lng_pulang: 106.8456,
      status_masuk: StatusMasuk.tepat_waktu,
      status_pulang: StatusPulang.tepat_waktu,
    },
  });

  // 9. Jurnal Sample
  await prisma.jurnal.create({
    data: {
      penempatan_pkl_id: penempatan1.id,
      tanggal: new Date('2026-07-23'),
      deskripsi_aktivitas: 'Mempelajari arsitektur backend NestJS dan membuat REST API endpoint untuk modul autentikasi.',
      status_verifikasi: StatusApproval.disetujui,
      catatan_verifikasi: 'Aktivitas bagus, pertahankan progres.',
      verified_by: guru1.id,
    },
  });

  // 10. Default Learning Objectives (Tujuan Pembelajaran)
  const tp1 = await prisma.tujuanPembelajaran.create({
    data: {
      nomor: 1,
      nama: 'Penerapan Etika Kerja dan Disiplin Industri',
    },
  });

  const tp2 = await prisma.tujuanPembelajaran.create({
    data: {
      nomor: 2,
      nama: 'Penguasaan Kompetensi Teknis Keahlian',
    },
  });

  await prisma.indikatorPenilaian.createMany({
    data: [
      {
        tujuan_pembelajaran_id: tp1.id,
        nomor_urut: '1.1',
        nama: 'Kedisiplinan dan Ketepatan Waktu',
        deskripsi: 'Menunjukkan tingkat kehadiran dan ketepatan jam kerja yang konsisten',
        tipe: TipeIndikator.guru,
      },
      {
        tujuan_pembelajaran_id: tp1.id,
        nomor_urut: '1.2',
        nama: 'Kepatuhan terhadap Prosedur K3 dan Peraturan DUDI',
        deskripsi: 'Mematuhi tata tertib dan Keselamatan Kerja di lingkungan DUDI',
        tipe: TipeIndikator.industri,
      },
      {
        tujuan_pembelajaran_id: tp2.id,
        nomor_urut: '2.1',
        nama: 'Kualitas Hasil Pekerjaan Teknis',
        deskripsi: 'Menyelesaikan tugas teknis sesuai standar kualitas industri',
        tipe: TipeIndikator.industri,
      },
    ],
  });

  // 11. System Settings
  await prisma.settings.createMany({
    data: [
      { key: 'nama_sekolah', value: 'SMK Negeri 1 Indonesia' },
      { key: 'jam_masuk_default', value: '08:00' },
      { key: 'toleransi_terlambat_menit', value: '15' },
      { key: 'bobot_nilai_sekolah', value: '40' },
      { key: 'bobot_nilai_industri', value: '60' },
    ],
  });

  console.log('Seed completed successfully!');
  console.log('Default credentials:');
  console.log('  Admin: admin@smk.sch.id / password123');
  console.log('  Guru:  guru1@smk.sch.id / password123');
  console.log('  Murid: siswa1@smk.sch.id / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
