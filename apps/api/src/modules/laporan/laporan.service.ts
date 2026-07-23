import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as Workbook from 'exceljs';
import type { Response } from 'express';

@Injectable()
export class LaporanService {
  constructor(private prisma: PrismaService) {}

  async exportPresensiExcel(res: Response) {
    const list = await this.prisma.presensi.findMany({
      include: {
        penempatan_pkl: {
          include: {
            murid: { include: { kelas: true } },
            dudi: true,
            guru: true,
          },
        },
      },
      orderBy: { tanggal: 'desc' },
    });

    const workbook = new Workbook.Workbook();
    const worksheet = workbook.addWorksheet('Rekap Presensi');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Nama Siswa', key: 'murid', width: 25 },
      { header: 'Kelas', key: 'kelas', width: 12 },
      { header: 'DUDI Tempat PKL', key: 'dudi', width: 28 },
      { header: 'Guru Pembimbing', key: 'guru', width: 25 },
      { header: 'Jam Masuk', key: 'jamMasuk', width: 12 },
      { header: 'Status Masuk', key: 'statusMasuk', width: 16 },
      { header: 'Jam Pulang', key: 'jamPulang', width: 12 },
      { header: 'Status Pulang', key: 'statusPulang', width: 16 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2563EB' },
    };

    list.forEach((p, idx) => {
      worksheet.addRow({
        no: idx + 1,
        tanggal: new Date(p.tanggal).toLocaleDateString('id-ID'),
        murid: p.penempatan_pkl.murid.nama,
        kelas: p.penempatan_pkl.murid.kelas.nama,
        dudi: p.penempatan_pkl.dudi.nama,
        guru: p.penempatan_pkl.guru.nama,
        jamMasuk: p.jam_masuk ? new Date(p.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        statusMasuk: p.status_masuk === 'tepat_waktu' ? 'Tepat Waktu' : p.status_masuk === 'terlambat' ? 'Terlambat' : '-',
        jamPulang: p.jam_pulang ? new Date(p.jam_pulang).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        statusPulang: p.status_pulang === 'tepat_waktu' ? 'Tepat Waktu' : p.status_pulang === 'pulang_cepat' ? 'Pulang Cepat' : '-',
      });
    });

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="rekap_presensi_pkl_${Date.now()}.xlsx"`,
    });

    await workbook.xlsx.write(res);
    res.end();
  }

  async exportJurnalExcel(res: Response) {
    const list = await this.prisma.jurnal.findMany({
      include: {
        penempatan_pkl: {
          include: {
            murid: true,
            dudi: true,
          },
        },
        guru_verifier: true,
      },
      orderBy: { tanggal: 'desc' },
    });

    const workbook = new Workbook.Workbook();
    const worksheet = workbook.addWorksheet('Jurnal Harian');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Nama Siswa', key: 'murid', width: 25 },
      { header: 'DUDI Tempat PKL', key: 'dudi', width: 28 },
      { header: 'Deskripsi Aktivitas Kegiatan', key: 'deskripsi', width: 45 },
      { header: 'Status Verifikasi', key: 'status', width: 18 },
      { header: 'Catatan Verifikasi Guru', key: 'catatan', width: 30 },
      { header: 'Verified By Guru', key: 'verifiedBy', width: 22 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '16A34A' },
    };

    list.forEach((j, idx) => {
      worksheet.addRow({
        no: idx + 1,
        tanggal: new Date(j.tanggal).toLocaleDateString('id-ID'),
        murid: j.penempatan_pkl.murid.nama,
        dudi: j.penempatan_pkl.dudi.nama,
        deskripsi: j.deskripsi_aktivitas,
        status: j.status_verifikasi === 'disetujui' ? 'Disetujui' : j.status_verifikasi === 'ditolak' ? 'Ditolak' : 'Pending',
        catatan: j.catatan_verifikasi || '-',
        verifiedBy: j.guru_verifier?.nama || '-',
      });
    });

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="jurnal_harian_pkl_${Date.now()}.xlsx"`,
    });

    await workbook.xlsx.write(res);
    res.end();
  }
}
