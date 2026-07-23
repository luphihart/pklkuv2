import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpsertPenilaianDto {
  @IsObject()
  @IsOptional()
  nilai_guru_json?: Record<string, number>;

  @IsObject()
  @IsOptional()
  nilai_industri_json?: Record<string, number>;

  @IsOptional()
  @IsString()
  catatan?: string;
}
