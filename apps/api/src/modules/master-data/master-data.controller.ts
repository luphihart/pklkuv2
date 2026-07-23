import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('master-data')
export class MasterDataController {
  constructor(private masterDataService: MasterDataService) {}

  @Get('dudi')
  getDudiList() {
    return this.masterDataService.getDudiList();
  }

  @Roles(Role.admin)
  @Post('dudi')
  createDudi(@Body() body: any) {
    return this.masterDataService.createDudi(body);
  }

  @Get('guru')
  getGuruList() {
    return this.masterDataService.getGuruList();
  }

  @Get('murid')
  getMuridList() {
    return this.masterDataService.getMuridList();
  }
}
