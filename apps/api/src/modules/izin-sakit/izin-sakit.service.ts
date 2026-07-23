import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIzinDto } from './dto/create-izin.dto';
import { ApproveIzinDto } from './dto/approve-izin.dto';
import { StatusPenempatan, StatusApproval } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class IzinSakitService {
  constructor(private prisma: PrismaService) {}

  async create(muridId: number, dto: CreateIzinDto, file?: Express.Multer.File) {
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

    let suratPath: string | null = null;
    if (file) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'izin');
      await fs.mkdir(uploadDir, { recursive: true });
      const fileName = `izin_${penempatan.id}_${Date.now()}.jpg`;
      await fs.writeFile(path.join(uploadDir, fileName), file.buffer);
      suratPath = `/uploads/izin/${fileName}`;
    }

    const item = await this.prisma.izinSakit.create({
      data: {
        penempatan_pkl_id: penempatan.id,
        tanggal_mulai: new Date(dto.tanggal_mulai),
        tanggal_selesai: new Date(dto.tanggal_selesai),
        tipe: dto.tipe,
        alasan: dto.alasan,
        surat_pendukung: suratPath,
        status_approval: StatusApproval.pending,
      },
    });

    return {
      message: 'Pengajuan izin/sakit berhasil dikirim',
      data: {
        id: Number(item.id),
        tipe: item.tipe,
        tanggalMulai: item.tanggal_mulai,
        tanggalSelesai: item.tanggal_selesai,
        statusApproval: item.status_approval,
      },
    };
  }

  async findAll(opts: { guruId?: number; muridId?: number; status?: StatusApproval }) {
    const whereClause: any = {};

    if (opts.status) {
      whereClause.status_approval = opts.status;
    }

    if (opts.muridId) {
      whereClause.penempatan_pkl = { murid_id: BigInt(opts.muridId) };
    } else if (opts.guruId) {
      whereClause.penempatan_pkl = { guru_id: BigInt(opts.guruId) };
    }

    const list = await this.prisma.izinSakit.findMany({
      where: whereClause,
      include: {
        penempatan_pkl: {
          include: {
            murid: true,
            dudi: true,
          },
        },
        guru_approver: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return list.map((i) => ({
      id: Number(i.id),
      tipe: i.tipe,
      tanggalMulai: i.tanggal_mulai,
      tanggalSelesai: i.tanggal_selesai,
      alasan: i.alasan,
      suratPendukung: i.surat_pendukung,
      statusApproval: i.status_approval,
      catatanGuru: i.catatan_guru,
      approvedByGuru: i.guru_approver?.nama || null,
      muridNama: i.penempatan_pkl.murid.nama,
      dudiNama: i.penempatan_pkl.dudi.nama,
    }));
  }

  async approve(id: number, guruId: number, dto: ApproveIzinDto) {
    const item = await this.prisma.izinSakit.findUnique({
      where: { id: BigInt(id) },
    });

    if (!item) {
      throw new NotFoundException('Data pengajuan izin tidak ditemukan');
    }

    const updated = await this.prisma.izinSakit.update({
      where: { id: BigInt(id) },
      data: {
        status_approval: dto.status_approval,
        catatan_guru: dto.catatan_guru,
        approved_by: guruId ? BigInt(guruId) : null,
      },
    });

    return {
      message: `Pengajuan izin berhasil di-update ke ${updated.status_approval}`,
      data: {
        id: Number(updated.id),
        statusApproval: updated.status_approval,
        catatanGuru: updated.catatan_guru,
      },
    };
  }
}
