import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateKunjunganDto } from './dto/create-kunjungan.dto';
import * as ejs from 'ejs';
import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class KunjunganService {
  constructor(private prisma: PrismaService) {}

  async create(guruId: number, dto: CreateKunjunganDto, file?: Express.Multer.File) {
    let fotoPath: string | null = null;
    if (file) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'kunjungan');
      await fs.mkdir(uploadDir, { recursive: true });
      const fileName = `kunjungan_${dto.penempatan_pkl_id}_${Date.now()}.jpg`;
      await fs.writeFile(path.join(uploadDir, fileName), file.buffer);
      fotoPath = `/uploads/kunjungan/${fileName}`;
    }

    const kunjungan = await this.prisma.kunjunganMonitoring.create({
      data: {
        penempatan_pkl_id: BigInt(dto.penempatan_pkl_id),
        tanggal: new Date(dto.tanggal),
        jenis_kunjungan: dto.jenis_kunjungan || 'Monitoring Berkala',
        deskripsi_kunjungan: dto.deskripsi_kunjungan,
        foto_kunjungan: fotoPath,
        latitude: dto.latitude || null,
        longitude: dto.longitude || null,
      },
    });

    return {
      message: 'Log kunjungan monitoring berhasil dicatat',
      data: { id: Number(kunjungan.id), tanggal: kunjungan.tanggal },
    };
  }

  async findAll(opts: { guruId?: number; penempatanId?: number }) {
    const whereClause: any = {};
    if (opts.penempatanId) {
      whereClause.penempatan_pkl_id = BigInt(opts.penempatanId);
    } else if (opts.guruId) {
      whereClause.penempatan_pkl = { guru_id: BigInt(opts.guruId) };
    }

    const list = await this.prisma.kunjunganMonitoring.findMany({
      where: whereClause,
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

    return list.map((k) => ({
      id: Number(k.id),
      tanggal: k.tanggal,
      jenisKunjungan: k.jenis_kunjungan,
      deskripsiKunjungan: k.deskripsi_kunjungan,
      fotoKunjungan: k.foto_kunjungan,
      muridNama: k.penempatan_pkl.murid.nama,
      kelasNama: k.penempatan_pkl.murid.kelas.nama,
      dudiNama: k.penempatan_pkl.dudi.nama,
      guruNama: k.penempatan_pkl.guru.nama,
    }));
  }

  async generateRekapPdfBuffer(guruId: number): Promise<Buffer> {
    const guru = await this.prisma.guru.findUnique({
      where: { id: BigInt(guruId) },
    });

    if (!guru) throw new NotFoundException('Guru tidak ditemukan');

    const list = await this.findAll({ guruId });

    const templateData = {
      guruNama: guru.nama,
      nip: guru.nip,
      list,
    };

    const templatePath = path.join(process.cwd(), 'src', 'templates', 'rekap-kunjungan.ejs');
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
