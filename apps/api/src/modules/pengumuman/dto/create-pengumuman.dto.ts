import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class CreatePengumumanDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul pengumuman wajib diisi' })
  judul: string;

  @IsString()
  @IsNotEmpty({ message: 'Isi pengumuman wajib diisi' })
  isi: string;

  @IsEnum(Role, { message: 'Target role tidak valid' })
  @IsOptional()
  target_role?: Role;
}
