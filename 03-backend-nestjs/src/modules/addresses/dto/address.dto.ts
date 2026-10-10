import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  @Length(1, 40)
  label?: string;

  @IsString()
  @Length(2, 100)
  city!: string;

  @IsString()
  @Length(3, 200)
  street!: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  apt?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  zip?: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  comment?: string;

  @IsLatitude()
  lat!: number;

  @IsLongitude()
  lng!: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}

/** Сохранённый адрес доставки (ответ /addresses). */
export class AddressDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ nullable: true })
  label!: string | null;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  street!: string;

  @ApiProperty({ nullable: true })
  apt!: string | null;

  @ApiProperty({ nullable: true })
  zip!: string | null;

  @ApiProperty({ nullable: true })
  comment!: string | null;

  @ApiProperty()
  lat!: number;

  @ApiProperty()
  lng!: number;

  @ApiProperty()
  isDefault!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}
