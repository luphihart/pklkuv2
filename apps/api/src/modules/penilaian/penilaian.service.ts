import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertPenilaianDto } from './dto/upsert-penilaian.dto';
import * as ejs from 'ejs';
import * as puppeteer from 'puppeteer';
import * as path from 'path';

@Injectable()
export class PenilaianService {
  constructor(private prisma: PrismaService) {}

  async getIndicators() {
    return this.prisma.tujuanPembelajaran.findMany({
      include: {
        indikator_penilaian: true,
      },
      orderBy: { nomor: 'asc' },
    });
  }

  async getByPenempatan(penempatanId: number) {
    const penempatan = await this.prisma.penempatanPkl.findUnique({
      where: { id: BigInt(penempatanId) },
      include: {
        murid: { include: { kelas: { include: { jurusan: true } } } },
        dudi: true,
        guru: true,
        pembimbing_industri: true,
        tahun_ajaran: true,
        penilaian_pkl: true,
      },
    });

    if (!penempatan) {
      throw new NotFoundException('Penempatan PKL tidak ditemukan');
    }

    const tps = await this.getIndicators();

    return {
      penempatanId: Number(penempatan.id),
      muridNama: penempatan.murid.nama,
      dudiNama: penempatan.dudi.nama,
      guruNama: penempatan.guru.nama,
      pembimbingIndustriNama: penempatan.pembimbing_industri?.nama || null,
      penilaian: penempatan.penilaian_pkl
        ? {
            id: Number(penempatan.penilaian_pkl.id),
            nilaiGuruJson: penempatan.penilaian_pkl.nilai_guru_json,
            nilaiIndustriJson: penempatan.penilaian_pkl.nilai_industri_json,
            rataNilaiGuru: penempatan.penilaian_pkl.rata_nilai_guru,
            rataNilaiIndustri: penempatan.penilaian_pkl.rata_nilai_industri,
            nilaiAkhir: penempatan.penilaian_pkl.nilai_akhir,
            catatan: penempatan.penilaian_pkl.catatan,
          }
        : null,
      tujuanPembelajaran: tps.map((tp) => ({
        id: Number(tp.id),
        nomor: tp.nomor,
        nama: tp.nama,
        indikator: tp.indikator_penilaian.map((ind) => ({
          id: Number(ind.id),
          nomorUrut: ind.nomor_urut,
          nama: ind.nama,
          tipe: ind.tipe,
        })),
      })),
    };
  }

  async upsertPenilaian(penempatanId: number, dto: UpsertPenilaianDto) {
    const penempatan = await this.prisma.penempatanPkl.findUnique({
      where: { id: BigInt(penempatanId) },
    });

    if (!penempatan) {
      throw new NotFoundException('Penempatan PKL tidak ditemukan');
    }

    const guruScores = dto.nilai_guru_json ? Object.values(dto.nilai_guru_json).map(Number) : [];
    const avgGuru = guruScores.length > 0 ? guruScores.reduce((a, b) => a + b, 0) / guruScores.length : 0;

    const indScores = dto.nilai_industri_json ? Object.values(dto.nilai_industri_json).map(Number) : [];
    const avgInd = indScores.length > 0 ? indScores.reduce((a, b) => a + b, 0) / indScores.length : 0;

    const nilaiAkhir = avgGuru * 0.4 + avgInd * 0.6;

    const result = await this.prisma.penilaianPkl.upsert({
      where: { penempatan_pkl_id: BigInt(penempatanId) },
      update: {
        nilai_guru_json: dto.nilai_guru_json as any,
        nilai_industri_json: dto.nilai_industri_json as any,
        rata_nilai_guru: avgGuru,
        rata_nilai_industri: avgInd,
        nilai_akhir: nilaiAkhir,
        catatan: dto.catatan,
      },
      create: {
        penempatan_pkl_id: BigInt(penempatanId),
        nilai_guru_json: dto.nilai_guru_json as any,
        nilai_industri_json: dto.nilai_industri_json as any,
        rata_nilai_guru: avgGuru,
        rata_nilai_industri: avgInd,
        nilai_akhir: nilaiAkhir,
        catatan: dto.catatan,
      },
    });

    return {
      message: 'Penilaian PKL berhasil disimpan',
      data: {
        id: Number(result.id),
        rataNilaiGuru: result.rata_nilai_guru,
        rataNilaiIndustri: result.rata_nilai_industri,
        nilaiAkhir: result.nilai_akhir,
      },
    };
  }

  async generateRaporPdfBuffer(penempatanId: number): Promise<Buffer> {
    const detail = await this.getByPenempatan(penempatanId);

    const penempatan = await this.prisma.penempatanPkl.findUnique({
      where: { id: BigInt(penempatanId) },
      include: {
        murid: { include: { kelas: { include: { jurusan: true } } } },
        dudi: true,
        guru: true,
        pembimbing_industri: true,
        tahun_ajaran: true,
      },
    });

    if (!penempatan) throw new NotFoundException('Penempatan tidak ditemukan');

    const nilaiGuruObj = (detail.penilaian?.nilaiGuruJson as any) || {};
    const nilaiIndObj = (detail.penilaian?.nilaiIndustriJson as any) || {};

    const indikatorList: any[] = [];
    detail.tujuanPembelajaran.forEach((tp) => {
      tp.indikator.forEach((ind) => {
        const score = ind.tipe === 'guru' ? nilaiGuruObj[ind.id] : nilaiIndObj[ind.id];
        indikatorList.push({
          tpNama: tp.nama,
          nama: ind.nama,
          tipe: ind.tipe,
          nilai: score !== undefined ? score : null,
        });
      });
    });

    const templateData = {
      muridNama: penempatan.murid.nama,
      nis: penempatan.murid.nis,
      kelasNama: penempatan.murid.kelas.nama,
      jurusanKode: penempatan.murid.kelas.jurusan.kode,
      dudiNama: penempatan.dudi.nama,
      guruNama: penempatan.guru.nama,
      pembimbingIndustriNama: penempatan.pembimbing_industri?.nama || null,
      tahunAjaran: penempatan.tahun_ajaran.tahun,
      semester: penempatan.tahun_ajaran.semester === 'ganjil' ? '1 (Ganjil)' : '2 (Genap)',
      indikatorList,
      rataNilaiGuru: detail.penilaian?.rataNilaiGuru || 0,
      rataNilaiIndustri: detail.penilaian?.rataNilaiIndustri || 0,
      nilaiAkhir: detail.penilaian?.nilaiAkhir || 0,
      catatan: detail.penilaian?.catatan || null,
    };

    const templatePath = path.join(process.cwd(), 'src', 'templates', 'rapor.ejs');
    const htmlString = await ejs.renderFile(templatePath, templateData);

    let browser: puppeteer.Browser | null = null;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(htmlString, { waitUntil: 'domcontentloaded' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      return Buffer.from(pdfBuffer);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
