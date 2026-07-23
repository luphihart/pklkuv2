import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PresensiModule } from './modules/presensi/presensi.module';
import { MasterDataModule } from './modules/master-data/master-data.module';

@Module({
  imports: [PrismaModule, AuthModule, PresensiModule, MasterDataModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
