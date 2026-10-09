import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from '../../products/dto/product.dto';

/** Список избранных товаров (ответ GET /favorites). */
export class FavoritesListDto {
  @ApiProperty({ type: [ProductDto] })
  items!: ProductDto[];
}

/** Лёгкий набор id избранного — для инициализации/синка клиентского стора. */
export class FavoriteIdsDto {
  @ApiProperty({ type: [String], description: 'productId избранных товаров' })
  ids!: string[];
}
