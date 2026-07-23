import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PresensiModule } from './modules/presensi/presensi.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { JurnalModule } from './modules/jurnal/jurnal.module';
import { IzinSakitModule } from './modules/izin-sakit/izin-sakit.module';
import { PenilaianModule } from './modules/penilaian/penilaian.module';
import { PenempatanModule } from './modules/penempatan/penempatan.module';
import { LaporanModule } from './modules/laporan/laporan.module';
import { KunjunganModule } from './modules/kunjungan/kunjungan.module';
import { PengumumanModule } from './modules/pengumuman/pengumuman.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PresensiModule,
    MasterDataModule,
    JurnalModule,
    IzinSakitModule,
    PenilaianModule,
    PenempatanModule,
    LaporanModule,
    KunjunganModule,
    PengumumanModule,
    SettingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
