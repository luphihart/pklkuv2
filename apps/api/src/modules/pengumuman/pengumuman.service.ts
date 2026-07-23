import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePengumumanDto } from './dto/create-pengumuman.dto';

@Injectable()
export class PengumumanService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: number, dto: CreatePengumumanDto) {
    const announcement = await this.prisma.pengumuman.create({
      data: {
        judul: dto.judul,
        isi: dto.isi,
        penulis_id: BigInt(authorId),
      },
    });

    const whereClause: any = { is_active: true, deleted_at: null };
    if (dto.target_role) {
      whereClause.role = dto.target_role;
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: { id: true },
    });

    if (users.length > 0) {
      await this.prisma.pengumumanPenerima.createMany({
        data: users.map((u) => ({
          pengumuman_id: announcement.id,
          user_id: u.id,
          is_read: false,
        })),
      });
    }

    return {
      message: 'Pengumuman berhasil dibuat dan dikirim ke penerima',
      data: { id: Number(announcement.id), judul: announcement.judul },
    };
  }

  async findAllForUser(userId: number) {
    const list = await this.prisma.pengumumanPenerima.findMany({
      where: { user_id: BigInt(userId) },
      include: {
        pengumuman: {
          include: { penulis: true },
        },
      },
    });

    return list.map((item) => ({
      id: Number(item.id),
      pengumumanId: Number(item.pengumuman_id),
      judul: item.pengumuman.judul,
      isi: item.pengumuman.isi,
      authorNama: item.pengumuman.penulis.name,
      isRead: item.is_read,
      readAt: item.read_at,
      createdAt: item.pengumuman.created_at,
    }));
  }

  async markAsRead(userId: number, pengumumanId: number) {
    const receiver = await this.prisma.pengumumanPenerima.findFirst({
      where: {
        user_id: BigInt(userId),
        pengumuman_id: BigInt(pengumumanId),
      },
    });

    if (!receiver) {
      throw new NotFoundException('Data pengumuman penerima tidak ditemukan');
    }

    await this.prisma.pengumumanPenerima.update({
      where: { id: receiver.id },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return { message: 'Pengumuman telah ditandai dibaca' };
  }
}
