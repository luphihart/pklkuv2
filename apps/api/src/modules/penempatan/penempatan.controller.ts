import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PenempatanService } from './penempatan.service';
import { CreatePenempatanDto } from './dto/create-penempatan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, StatusPenempatan } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('penempatan-pkl')
export class PenempatanController {
  constructor(private penempatanService: PenempatanService) {}

  @Roles(Role.admin)
  @Post()
  create(@Body() dto: CreatePenempatanDto) {
    return this.penempatanService.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('status') status?: StatusPenempatan) {
    const guruId = user.role === Role.guru ? user.guruId : undefined;
    return this.penempatanService.findAll({ guruId, status });
  }

  @Roles(Role.admin)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: StatusPenempatan,
  ) {
    return this.penempatanService.updateStatus(id, status);
  }
}
