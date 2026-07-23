import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IzinSakitService } from './izin-sakit.service';
import { CreateIzinDto } from './dto/create-izin.dto';
import { ApproveIzinDto } from './dto/approve-izin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, StatusApproval } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('izin-sakit')
export class IzinSakitController {
  constructor(private izinSakitService: IzinSakitService) {}

  @Roles(Role.murid)
  @Post()
  @UseInterceptors(FileInterceptor('surat'))
  async create(
    @CurrentUser('muridId') muridId: number,
    @Body() dto: CreateIzinDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.izinSakitService.create(muridId, dto, file);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('status') status?: StatusApproval,
  ) {
    if (user.role === Role.murid) {
      return this.izinSakitService.findAll({ muridId: user.muridId, status });
    } else if (user.role === Role.guru) {
      return this.izinSakitService.findAll({ guruId: user.guruId, status });
    }
    return this.izinSakitService.findAll({ status });
  }

  @Roles(Role.guru, Role.admin)
  @Patch(':id/approve')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('guruId') guruId: number,
    @Body() dto: ApproveIzinDto,
  ) {
    return this.izinSakitService.approve(id, guruId, dto);
  }
}
