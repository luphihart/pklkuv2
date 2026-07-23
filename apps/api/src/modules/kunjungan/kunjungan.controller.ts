import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { KunjunganService } from './kunjungan.service';
import { CreateKunjunganDto } from './dto/create-kunjungan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kunjungan')
export class KunjunganController {
  constructor(private kunjunganService: KunjunganService) {}

  @Roles(Role.guru)
  @Post()
  @UseInterceptors(FileInterceptor('foto'))
  create(
    @CurrentUser('guruId') guruId: number,
    @Body() dto: CreateKunjunganDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.kunjunganService.create(guruId, dto, file);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('penempatanId') penempatanId?: string) {
    const guruId = user.role === Role.guru ? user.guruId : undefined;
    return this.kunjunganService.findAll({
      guruId,
      penempatanId: penempatanId ? parseInt(penempatanId) : undefined,
    });
  }

  @Roles(Role.guru)
  @Get('rekap-pdf')
  async downloadRekapPdf(@CurrentUser('guruId') guruId: number, @Res() res: Response) {
    const pdfBuffer = await this.kunjunganService.generateRekapPdfBuffer(guruId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="rekap_kunjungan_${guruId}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    });

    res.end(pdfBuffer);
  }
}
