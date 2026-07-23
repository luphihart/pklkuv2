import { Injectable, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckinDto } from './dto/checkin.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { calculateHaversineDistance } from '../../common/utils/haversine.util';
import { compressAndWatermarkImage } from '../../common/utils/image.util';
import { StatusMasuk, StatusPulang, StatusPenempatan } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class PresensiService {
  constructor(private prisma: PrismaService) {}

  async checkin(muridId: number, dto: CheckinDto, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Foto selfie presensi wajib diunggah');
    }

    const penempatan = await this.prisma.penempatanPkl.findFirst({
      where: {
        murid_id: BigInt(muridId),
        status: StatusPenempatan.aktif,
        deleted_at: null,
      },
      include: {
        dudi: true,
        murid: true,
      },
    });

    if (!penempatan) {
      throw new ForbiddenException('Anda belum memiliki penempatan PKL aktif');
    }

    const distance = calculateHaversineDistance(
      dto.latitude,
      dto.longitude,
      penempatan.dudi.latitude,
      penempatan.dudi.longitude,
    );

    if (distance > penempatan.dudi.radius_meter) {
      throw new ForbiddenException(
        `Presensi ditolak. Anda berada ${distance}m dari lokasi ${penempatan.dudi.nama} (radius maksimal ${penempatan.dudi.radius_meter}m).`,
      );
    }

    const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const todayName = daysName[new Date().getDay()];
    const allowedDays = penempatan.dudi.hari_kerja.split(',').map((d) => d.trim());

    if (!allowedDays.includes(todayName)) {
      throw new BadRequestException(`Hari ${todayName} bukan hari kerja resmi di ${penempatan.dudi.nama}`);
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const existing = await this.prisma.presensi.findUnique({
      where: {
        penempatan_pkl_id_tanggal: {
          penempatan_pkl_id: penempatan.id,
          tanggal: todayDate,
        },
      },
    });

    if (existing && existing.jam_masuk) {
      throw new ConflictException('Anda sudah melakukan presensi masuk hari ini');
    }

    const watermarkText = `${penempatan.murid.nama} | ${penempatan.dudi.nama} | ${new Date().toLocaleString('id-ID')} | Lat: ${dto.latitude.toFixed(5)}, Lng: ${dto.longitude.toFixed(5)}`;
    const compressedBuffer = await compressAndWatermarkImage(file.buffer, watermarkText);

    const uploadDir = path.join(process.cwd(), 'uploads', 'presensi');
    await fs.mkdir(uploadDir, { recursive: true });
    const fileName = `checkin_${penempatan.id}_${Date.now()}.jpg`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, compressedBuffer);

    const relativePath = `/uploads/presensi/${fileName}`;

    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(8, 0, 0, 0);
    const statusMasuk = now > targetTime ? StatusMasuk.terlambat : StatusMasuk.tepat_waktu;

    const result = await this.prisma.presensi.upsert({
      where: {
        penempatan_pkl_id_tanggal: {
          penempatan_pkl_id: penempatan.id,
          tanggal: todayDate,
        },
      },
      update: {
        jam_masuk: now,
        lat_masuk: dto.latitude,
        lng_masuk: dto.longitude,
        foto_masuk: relativePath,
        status_masuk: statusMasuk,
      },
      create: {
        penempatan_pkl_id: penempatan.id,
        tanggal: todayDate,
        jam_masuk: now,
        lat_masuk: dto.latitude,
        lng_masuk: dto.longitude,
        foto_masuk: relativePath,
        status_masuk: statusMasuk,
      },
    });

    return {
      message: `Presensi masuk berhasil! Status: ${statusMasuk === StatusMasuk.tepat_waktu ? 'Tepat Waktu' : 'Terlambat'}`,
      data: {
        id: Number(result.id),
        tanggal: result.tanggal,
        jam_masuk: result.jam_masuk,
        status_masuk: result.status_masuk,
        foto_masuk: result.foto_masuk,
        jarak: distance,
      },
    };
  }

  async checkout(muridId: number, dto: CheckoutDto, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Foto selfie presensi pulang wajib diunggah');
    }

    const penempatan = await this.prisma.penempatanPkl.findFirst({
      where: {
        murid_id: BigInt(muridId),
        status: StatusPenempatan.aktif,
        deleted_at: null,
      },
      include: {
        dudi: true,
        murid: true,
      },
    });

    if (!penempatan) {
      throw new ForbiddenException('Anda belum memiliki penempatan PKL aktif');
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const existing = await this.prisma.presensi.findUnique({
      where: {
        penempatan_pkl_id_tanggal: {
          penempatan_pkl_id: penempatan.id,
          tanggal: todayDate,
        },
      },
    });

    if (!existing || !existing.jam_masuk) {
      throw new BadRequestException('Anda belum melakukan presensi masuk hari ini');
    }

    if (existing.jam_pulang) {
      throw new ConflictException('Anda sudah melakukan presensi pulang hari ini');
    }

    const distance = calculateHaversineDistance(
      dto.latitude,
      dto.longitude,
      penempatan.dudi.latitude,
      penempatan.dudi.longitude,
    );

    if (distance > penempatan.dudi.radius_meter) {
      throw new ForbiddenException(
        `Presensi pulang ditolak. Anda berada ${distance}m dari lokasi ${penempatan.dudi.nama}.`,
      );
    }

    const watermarkText = `PULANG | ${penempatan.murid.nama} | ${penempatan.dudi.nama} | ${new Date().toLocaleString('id-ID')}`;
    const compressedBuffer = await compressAndWatermarkImage(file.buffer, watermarkText);

    const uploadDir = path.join(process.cwd(), 'uploads', 'presensi');
    await fs.mkdir(uploadDir, { recursive: true });
    const fileName = `checkout_${penempatan.id}_${Date.now()}.jpg`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, compressedBuffer);

    const relativePath = `/uploads/presensi/${fileName}`;

    const now = new Date();
    const targetPulang = new Date();
    targetPulang.setHours(16, 0, 0, 0);
    const statusPulang = now < targetPulang ? StatusPulang.pulang_cepat : StatusPulang.tepat_waktu;

    const result = await this.prisma.presensi.update({
      where: { id: existing.id },
      data: {
        jam_pulang: now,
        lat_pulang: dto.latitude,
        lng_pulang: dto.longitude,
        foto_pulang: relativePath,
        status_pulang: statusPulang,
      },
    });

    return {
      message: 'Presensi pulang berhasil dicatat',
      data: {
        id: Number(result.id),
        jam_pulang: result.jam_pulang,
        status_pulang: result.status_pulang,
        foto_pulang: result.foto_pulang,
      },
    };
  }

  async getTodayStatus(muridId: number) {
    const penempatan = await this.prisma.penempatanPkl.findFirst({
      where: {
        murid_id: BigInt(muridId),
        status: StatusPenempatan.aktif,
        deleted_at: null,
      },
      include: { dudi: true },
    });

    if (!penempatan) return { penempatan: null, presensi: null };

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const presensi = await this.prisma.presensi.findUnique({
      where: {
        penempatan_pkl_id_tanggal: {
          penempatan_pkl_id: penempatan.id,
          tanggal: todayDate,
        },
      },
    });

    return {
      penempatan: {
        id: Number(penempatan.id),
        dudiNama: penempatan.dudi.nama,
        dudiLatitude: penempatan.dudi.latitude,
        dudiLongitude: penempatan.dudi.longitude,
        radiusMeter: penempatan.dudi.radius_meter,
        hariKerja: penempatan.dudi.hari_kerja,
      },
      presensi: presensi
        ? {
            id: Number(presensi.id),
            jamMasuk: presensi.jam_masuk,
            jamPulang: presensi.jam_pulang,
            statusMasuk: presensi.status_masuk,
            statusPulang: presensi.status_pulang,
            fotoMasuk: presensi.foto_masuk,
            fotoPulang: presensi.foto_pulang,
          }
        : null,
    };
  }

  async findAll(guruId?: number, tanggal?: string) {
    const filterDate = tanggal ? new Date(tanggal) : new Date();
    filterDate.setHours(0, 0, 0, 0);

    const wherePenempatan: any = { status: StatusPenempatan.aktif, deleted_at: null };
    if (guruId) {
      wherePenempatan.guru_id = BigInt(guruId);
    }

    const list = await this.prisma.presensi.findMany({
      where: {
        tanggal: filterDate,
        penempatan_pkl: wherePenempatan,
      },
      include: {
        penempatan_pkl: {
          include: {
            murid: true,
            dudi: true,
            guru: true,
          },
        },
      },
      orderBy: { jam_masuk: 'desc' },
    });

    return list.map((p) => ({
      id: Number(p.id),
      tanggal: p.tanggal,
      jamMasuk: p.jam_masuk,
      jamPulang: p.jam_pulang,
      statusMasuk: p.status_masuk,
      statusPulang: p.status_pulang,
      fotoMasuk: p.foto_masuk,
      fotoPulang: p.foto_pulang,
      muridNama: p.penempatan_pkl.murid.nama,
      dudiNama: p.penempatan_pkl.dudi.nama,
      guruNama: p.penempatan_pkl.guru.nama,
    }));
  }
}
