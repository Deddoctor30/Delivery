import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

/** Пагинированный список товаров (ответ GET /products). */
export class ProductListDto {
  @ApiProperty({ type: [ProductDto] })
  items!: ProductDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}
