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
import { JurnalService } from './jurnal.service';
import { CreateJurnalDto } from './dto/create-jurnal.dto';
import { VerifyJurnalDto } from './dto/verify-jurnal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, StatusApproval } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jurnal')
export class JurnalController {
  constructor(private jurnalService: JurnalService) {}

  @Roles(Role.murid)
  @Post()
  @UseInterceptors(FileInterceptor('foto'))
  async create(
    @CurrentUser('muridId') muridId: number,
    @Body() dto: CreateJurnalDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.jurnalService.create(muridId, dto, file);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('status') status?: StatusApproval,
  ) {
    if (user.role === Role.murid) {
      return this.jurnalService.findAll({ muridId: user.muridId, status });
    } else if (user.role === Role.guru) {
      return this.jurnalService.findAll({ guruId: user.guruId, status });
    }
    return this.jurnalService.findAll({ status });
  }

  @Roles(Role.guru, Role.admin)
  @Patch(':id/verify')
  async verify(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('guruId') guruId: number,
    @Body() dto: VerifyJurnalDto,
  ) {
    return this.jurnalService.verify(id, guruId, dto);
  }
}
