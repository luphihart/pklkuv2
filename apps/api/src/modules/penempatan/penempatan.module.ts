import { Module } from '@nestjs/common';
import { PenempatanService } from './penempatan.service';
import { PenempatanController } from './penempatan.controller';

@Module({
  controllers: [PenempatanController],
  providers: [PenempatanService],
  exports: [PenempatanService],
})
export class PenempatanModule {}
