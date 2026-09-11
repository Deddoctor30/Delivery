import { IsNumber, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @MinLength(5)
  deliveryAddress!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  deliveryLat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  deliveryLng!: number;
}
