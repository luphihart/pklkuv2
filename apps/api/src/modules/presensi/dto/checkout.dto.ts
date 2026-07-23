import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'Latitude wajib diisi' })
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'Longitude wajib diisi' })
  longitude: number;
}
