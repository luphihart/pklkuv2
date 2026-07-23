import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePenempatanDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'Murid wajib dipilih' })
  murid_id: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'DUDI wajib dipilih' })
  dudi_id: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'Guru Pembimbing wajib dipilih' })
  guru_id: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pembimbing_industri_id?: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'Tahun Ajaran wajib dipilih' })
  tahun_ajaran_id: number;

  @IsString()
  @IsNotEmpty({ message: 'Tanggal mulai wajib diisi' })
  tanggal_mulai: string;

  @IsString()
  @IsNotEmpty({ message: 'Tanggal selesai wajib diisi' })
  tanggal_selesai: string;
}
