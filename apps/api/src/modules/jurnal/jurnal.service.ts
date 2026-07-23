import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJurnalDto } from './dto/create-jurnal.dto';
import { VerifyJurnalDto } from './dto/verify-jurnal.dto';
import { StatusPenempatan, StatusApproval } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class JurnalService {
  constructor(private prisma: PrismaService) {}

  async create(muridId: number, dto: CreateJurnalDto, file?: Express.Multer.File) {
    const penempatan = await this.prisma.penempatanPkl.findFirst({
      where: {
        murid_id: BigInt(muridId),
        status: StatusPenempatan.aktif,
        deleted_at: null,
      },
    });

    if (!penempatan) {
      throw new ForbiddenException('Anda tidak memiliki penempatan PKL aktif');
    }

    let fotoPath: string | null = null;

    if (file) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'jurnal');
      await fs.mkdir(uploadDir, { recursive: true });
      const fileName = `jurnal_${penempatan.id}_${Date.now()}.jpg`;
      await fs.writeFile(path.join(uploadDir, fileName), file.buffer);
      fotoPath = `/uploads/jurnal/${fileName}`;
    }

    const targetDate = dto.tanggal ? new Date(dto.tanggal) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const jurnal = await this.prisma.jurnal.create({
      data: {
        penempatan_pkl_id: penempatan.id,
        tanggal: targetDate,
        deskripsi_aktivitas: dto.deskripsi_aktivitas,
        foto_kegiatan: fotoPath,
        status_verifikasi: StatusApproval.pending,
      },
    });

    return {
      message: 'Jurnal harian berhasil dikirim untuk verifikasi Guru',
      data: {
        id: Number(jurnal.id),
        tanggal: jurnal.tanggal,
        deskripsi: jurnal.deskripsi_aktivitas,
        statusVerifikasi: jurnal.status_verifikasi,
        fotoKegiatan: jurnal.foto_kegiatan,
      },
    };
  }

  async findAll(opts: { guruId?: number; muridId?: number; status?: StatusApproval }) {
    const whereClause: any = {};

    if (opts.status) {
      whereClause.status_verifikasi = opts.status;
    }

    if (opts.muridId) {
      whereClause.penempatan_pkl = { murid_id: BigInt(opts.muridId) };
    } else if (opts.guruId) {
      whereClause.penempatan_pkl = { guru_id: BigInt(opts.guruId) };
    }

    const list = await this.prisma.jurnal.findMany({
      where: whereClause,
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

    return list.map((j) => ({
      id: Number(j.id),
      tanggal: j.tanggal,
      deskripsiAktivitas: j.deskripsi_aktivitas,
      fotoKegiatan: j.foto_kegiatan,
      statusVerifikasi: j.status_verifikasi,
      catatanVerifikasi: j.catatan_verifikasi,
      verifiedByGuru: j.guru_verifier?.nama || null,
      muridNama: j.penempatan_pkl.murid.nama,
      dudiNama: j.penempatan_pkl.dudi.nama,
    }));
  }

  async verify(jurnalId: number, guruId: number, dto: VerifyJurnalDto) {
    const jurnal = await this.prisma.jurnal.findUnique({
      where: { id: BigInt(jurnalId) },
    });

    if (!jurnal) {
      throw new NotFoundException('Data jurnal tidak ditemukan');
    }

    const updated = await this.prisma.jurnal.update({
      where: { id: BigInt(jurnalId) },
      data: {
        status_verifikasi: dto.status_verifikasi,
        catatan_verifikasi: dto.catatan_verifikasi,
        verified_by: guruId ? BigInt(guruId) : null,
      },
    });

    return {
      message: `Jurnal berhasil di-update ke status ${updated.status_verifikasi}`,
      data: {
        id: Number(updated.id),
        statusVerifikasi: updated.status_verifikasi,
        catatanVerifikasi: updated.catatan_verifikasi,
      },
    };
  }
}
