import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { LaporanService } from './laporan.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.guru)
@Controller('laporan')
export class LaporanController {
  constructor(private laporanService: LaporanService) {}

  @Get('presensi/export')
  exportPresensi(@Res() res: Response) {
    return this.laporanService.exportPresensiExcel(res);
  }

  @Get('jurnal/export')
  exportJurnal(@Res() res: Response) {
    return this.laporanService.exportJurnalExcel(res);
  }
}
