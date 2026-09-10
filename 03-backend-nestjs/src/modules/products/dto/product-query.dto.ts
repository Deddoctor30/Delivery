import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

// query приходит строками — булевы парсим аккуратно, сохраняя undefined если параметра нет
const toBool = ({ value }: { value: unknown }) =>
  value === undefined ? undefined : value === 'true' || value === true;

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  popular?: boolean;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  seasonal?: boolean;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  discounted?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsIn(['newest', 'price_asc', 'price_desc', 'name'])
  sort: 'newest' | 'price_asc' | 'price_desc' | 'name' = 'newest';
}
