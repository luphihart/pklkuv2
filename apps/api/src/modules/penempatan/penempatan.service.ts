import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePenempatanDto } from './dto/create-penempatan.dto';
import { StatusPenempatan } from '@prisma/client';

@Injectable()
export class PenempatanService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePenempatanDto) {
    const existing = await this.prisma.penempatanPkl.findFirst({
      where: {
        murid_id: BigInt(dto.murid_id),
        tahun_ajaran_id: BigInt(dto.tahun_ajaran_id),
        status: StatusPenempatan.aktif,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new ConflictException('Murid ini sudah memiliki penempatan PKL aktif pada tahun ajaran ini');
    }

    const penempatan = await this.prisma.penempatanPkl.create({
      data: {
        murid_id: BigInt(dto.murid_id),
        dudi_id: BigInt(dto.dudi_id),
        guru_id: BigInt(dto.guru_id),
        pembimbing_industri_id: dto.pembimbing_industri_id ? BigInt(dto.pembimbing_industri_id) : null,
        tahun_ajaran_id: BigInt(dto.tahun_ajaran_id),
        tanggal_mulai: new Date(dto.tanggal_mulai),
        tanggal_selesai: new Date(dto.tanggal_selesai),
        status: StatusPenempatan.aktif,
      },
      include: {
        murid: true,
        dudi: true,
        guru: true,
        pembimbing_industri: true,
      },
    });

    return {
      message: 'Plotting penempatan PKL berhasil disimpan',
      data: {
        id: Number(penempatan.id),
        muridNama: penempatan.murid.nama,
        dudiNama: penempatan.dudi.nama,
        guruNama: penempatan.guru.nama,
        pembimbingIndustriNama: penempatan.pembimbing_industri?.nama || null,
        tanggalMulai: penempatan.tanggal_mulai,
        tanggalSelesai: penempatan.tanggal_selesai,
        status: penempatan.status,
      },
    };
  }

  async findAll(opts: { guruId?: number; status?: StatusPenempatan }) {
    const whereClause: any = { deleted_at: null };
    if (opts.status) whereClause.status = opts.status;
    if (opts.guruId) whereClause.guru_id = BigInt(opts.guruId);

    const list = await this.prisma.penempatanPkl.findMany({
      where: whereClause,
      include: {
        murid: { include: { kelas: { include: { jurusan: true } } } },
        dudi: true,
        guru: true,
        pembimbing_industri: true,
        tahun_ajaran: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return list.map((p) => ({
      id: Number(p.id),
      muridId: Number(p.murid_id),
      muridNama: p.murid.nama,
      muridNis: p.murid.nis,
      kelasNama: p.murid.kelas.nama,
      jurusanKode: p.murid.kelas.jurusan.kode,
      dudiId: Number(p.dudi_id),
      dudiNama: p.dudi.nama,
      dudiAlamat: p.dudi.alamat,
      guruId: Number(p.guru_id),
      guruNama: p.guru.nama,
      pembimbingIndustriNama: p.pembimbing_industri?.nama || null,
      tahunAjaran: p.tahun_ajaran.tahun,
      tanggalMulai: p.tanggal_mulai,
      tanggalSelesai: p.tanggal_selesai,
      status: p.status,
    }));
  }

  async updateStatus(id: number, status: StatusPenempatan) {
    const updated = await this.prisma.penempatanPkl.update({
      where: { id: BigInt(id) },
      data: { status },
    });

    return {
      message: `Status penempatan PKL diubah menjadi ${updated.status}`,
      data: { id: Number(updated.id), status: updated.status },
    };
  }
}
