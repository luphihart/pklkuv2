import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateJurnalDto {
  @IsString()
  @IsNotEmpty({ message: 'Deskripsi aktivitas kegiatan wajib diisi' })
  deskripsi_aktivitas: string;

  @IsOptional()
  @IsString()
  tanggal?: string;
}
