import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MasterDataService {
  constructor(private prisma: PrismaService) {}

  async getDudiList() {
    const list = await this.prisma.dudi.findMany({
      where: { deleted_at: null },
      include: { pembimbing_industri: { where: { deleted_at: null } } },
      orderBy: { nama: 'asc' },
    });
    return list.map((d) => ({
      id: Number(d.id),
      nama: d.nama,
      alamat: d.alamat,
      latitude: d.latitude,
      longitude: d.longitude,
      radiusMeter: d.radius_meter,
      picNama: d.pic_nama,
      picPhone: d.pic_phone,
      hariKerja: d.hari_kerja,
      pembimbing: d.pembimbing_industri.map((p) => ({
        id: Number(p.id),
        nama: p.nama,
        phone: p.phone,
        email: p.email,
      })),
    }));
  }

  async createDudi(data: any) {
    const dudi = await this.prisma.dudi.create({
      data: {
        nama: data.nama,
        alamat: data.alamat,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        radius_meter: parseInt(data.radiusMeter || 50),
        pic_nama: data.picNama,
        pic_phone: data.picPhone,
        hari_kerja: data.hariKerja || 'Senin,Selasa,Rabu,Kamis,Jumat',
      },
    });
    return { ...dudi, id: Number(dudi.id) };
  }

  async getGuruList() {
    const list = await this.prisma.guru.findMany({
      where: { deleted_at: null },
      include: { user: true },
      orderBy: { nama: 'asc' },
    });
    return list.map((g) => ({
      id: Number(g.id),
      userId: Number(g.user_id),
      nip: g.nip,
      nama: g.nama,
      email: g.user.email,
      phone: g.user.phone,
    }));
  }

  async getMuridList() {
    const list = await this.prisma.murid.findMany({
      where: { deleted_at: null },
      include: { user: true, kelas: { include: { jurusan: true } } },
      orderBy: { nama: 'asc' },
    });
    return list.map((m) => ({
      id: Number(m.id),
      userId: Number(m.user_id),
      nis: m.nis,
      nama: m.nama,
      email: m.user.email,
      phone: m.user.phone,
      kelasNama: m.kelas.nama,
      jurusanKode: m.kelas.jurusan.kode,
    }));
  }
}
