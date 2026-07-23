import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StatusApproval } from '@prisma/client';

export class ApproveIzinDto {
  @IsEnum(StatusApproval, { message: 'Status approval tidak valid' })
  @IsNotEmpty()
  status_approval: StatusApproval;

  @IsOptional()
  @IsString()
  catatan_guru?: string;
}
