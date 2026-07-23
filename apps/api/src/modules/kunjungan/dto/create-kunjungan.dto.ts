import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateKunjunganDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'Penempatan PKL wajib dipilih' })
  penempatan_pkl_id: number;

  @IsString()
  @IsNotEmpty({ message: 'Tanggal kunjungan wajib diisi' })
  tanggal: string;

  @IsString()
  @IsOptional()
  jenis_kunjungan?: string;

  @IsString()
  @IsNotEmpty({ message: 'Deskripsi hasil kunjungan wajib diisi' })
  deskripsi_kunjungan: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
