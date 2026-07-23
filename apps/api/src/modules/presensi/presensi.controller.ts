import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PresensiService } from './presensi.service';
import { CheckinDto } from './dto/checkin.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('presensi')
export class PresensiController {
  constructor(private presensiService: PresensiService) {}

  @Roles(Role.murid)
  @Post('checkin')
  @UseInterceptors(FileInterceptor('foto'))
  async checkin(
    @CurrentUser('muridId') muridId: number,
    @Body() dto: CheckinDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.presensiService.checkin(muridId, dto, file);
  }

  @Roles(Role.murid)
  @Post('checkout')
  @UseInterceptors(FileInterceptor('foto'))
  async checkout(
    @CurrentUser('muridId') muridId: number,
    @Body() dto: CheckoutDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.presensiService.checkout(muridId, dto, file);
  }

  @Roles(Role.murid)
  @Get('today')
  async getTodayStatus(@CurrentUser('muridId') muridId: number) {
    return this.presensiService.getTodayStatus(muridId);
  }

  @Roles(Role.admin, Role.guru)
  @Get()
  async findAll(@CurrentUser() user: any, @Query('tanggal') tanggal?: string) {
    const guruId = user.role === Role.guru ? user.guruId : undefined;
    return this.presensiService.findAll(guruId, tanggal);
  }
}
