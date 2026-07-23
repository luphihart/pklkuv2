import { Module } from '@nestjs/common';
import { PengumumanService } from './pengumuman.service';
import { PengumumanController } from './pengumuman.controller';

@Module({
  controllers: [PengumumanController],
  providers: [PengumumanService],
  exports: [PengumumanService],
})
export class PengumumanModule {}
