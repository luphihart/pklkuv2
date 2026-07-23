import { Module } from '@nestjs/common';
import { PenilaianService } from './penilaian.service';
import { PenilaianController } from './penilaian.controller';

@Module({
  controllers: [PenilaianController],
  providers: [PenilaianService],
  exports: [PenilaianService],
})
export class PenilaianModule {}
