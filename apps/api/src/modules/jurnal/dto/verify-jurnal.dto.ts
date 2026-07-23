import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StatusApproval } from '@prisma/client';

export class VerifyJurnalDto {
  @IsEnum(StatusApproval, { message: 'Status verifikasi tidak valid' })
  @IsNotEmpty()
  status_verifikasi: StatusApproval;

  @IsOptional()
  @IsString()
  catatan_verifikasi?: string;
}
