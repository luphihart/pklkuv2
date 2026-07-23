import { Module } from '@nestjs/common';
import { IzinSakitService } from './izin-sakit.service';
import { IzinSakitController } from './izin-sakit.controller';

@Module({
  controllers: [IzinSakitController],
  providers: [IzinSakitService],
  exports: [IzinSakitService],
})
export class IzinSakitModule {}
