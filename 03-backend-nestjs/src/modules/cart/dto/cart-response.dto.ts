import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from '../../products/dto/product.dto';

/** Позиция корзины с вложенным товаром. */
export class CartItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty({ type: ProductDto })
  product!: ProductDto;
}

/** Корзина пользователя (ответ всех методов /cart). */
export class CartDto {
  @ApiProperty({ type: [CartItemDto] })
  items!: CartItemDto[];

  @ApiProperty({ description: 'Сумма к оплате в копейках' })
  total!: number;
}
