import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PengumumanService } from './pengumuman.service';
import { CreatePengumumanDto } from './dto/create-pengumuman.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pengumuman')
export class PengumumanController {
  constructor(private pengumumanService: PengumumanService) {}

  @Roles(Role.admin)
  @Post()
  create(@CurrentUser('userId') userId: number, @Body() dto: CreatePengumumanDto) {
    return this.pengumumanService.create(userId, dto);
  }

  @Get()
  findAllForUser(@CurrentUser('userId') userId: number) {
    return this.pengumumanService.findAllForUser(userId);
  }

  @Patch(':id/read')
  markAsRead(
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) pengumumanId: number,
  ) {
    return this.pengumumanService.markAsRead(userId, pengumumanId);
  }
}
