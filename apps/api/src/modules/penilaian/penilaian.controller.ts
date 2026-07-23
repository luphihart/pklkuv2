import { Controller, Get, Post, Body, Param, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { PenilaianService } from './penilaian.service';
import { UpsertPenilaianDto } from './dto/upsert-penilaian.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('penilaian')
export class PenilaianController {
  constructor(private penilaianService: PenilaianService) {}

  @Get('indikator')
  getIndicators() {
    return this.penilaianService.getIndicators();
  }

  @Get(':penempatanId')
  getByPenempatan(@Param('penempatanId', ParseIntPipe) penempatanId: number) {
    return this.penilaianService.getByPenempatan(penempatanId);
  }

  @Roles(Role.guru, Role.admin)
  @Post(':penempatanId')
  upsertPenilaian(
    @Param('penempatanId', ParseIntPipe) penempatanId: number,
    @Body() dto: UpsertPenilaianDto,
  ) {
    return this.penilaianService.upsertPenilaian(penempatanId, dto);
  }

  @Get(':penempatanId/rapor-pdf')
  async downloadRaporPdf(
    @Param('penempatanId', ParseIntPipe) penempatanId: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.penilaianService.generateRaporPdfBuffer(penempatanId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="rapor_pkl_${penempatanId}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    });

    res.end(pdfBuffer);
  }
}
