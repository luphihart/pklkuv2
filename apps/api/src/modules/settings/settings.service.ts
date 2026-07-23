import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const list = await this.prisma.settings.findMany();
    const result: Record<string, string> = {
      nama_sekolah: 'SMK NEGERI 1 INDONESIA',
      jam_masuk_default: '07:30',
      jam_pulang_default: '16:00',
      toleransi_terlambat_menit: '15',
      bobot_sekolah: '40',
      bobot_industri: '60',
    };

    list.forEach((item) => {
      if (item.value !== null) {
        result[item.key] = item.value;
      }
    });

    return result;
  }

  async update(key: string, value: string) {
    const setting = await this.prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return {
      message: `Pengaturan ${key} berhasil diperbarui`,
      data: { key: setting.key, value: setting.value },
    };
  }
}
