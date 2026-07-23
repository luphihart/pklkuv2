import { Module } from '@nestjs/common';
import { JurnalService } from './jurnal.service';
import { JurnalController } from './jurnal.controller';

@Module({
  controllers: [JurnalController],
  providers: [JurnalService],
  exports: [JurnalService],
})
export class JurnalModule {}
