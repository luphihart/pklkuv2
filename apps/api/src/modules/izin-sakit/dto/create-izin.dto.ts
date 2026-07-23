import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TipeIzin } from '@prisma/client';

export class CreateIzinDto {
  @IsString()
  @IsNotEmpty({ message: 'Tanggal mulai wajib diisi' })
  tanggal_mulai: string;

  @IsString()
  @IsNotEmpty({ message: 'Tanggal selesai wajib diisi' })
  tanggal_selesai: string;

  @IsEnum(TipeIzin, { message: 'Tipe pengajuan harus izin atau sakit' })
  @IsNotEmpty()
  tipe: TipeIzin;

  @IsString()
  @IsNotEmpty({ message: 'Alasan pengajuan wajib diisi' })
  alasan: string;
}
