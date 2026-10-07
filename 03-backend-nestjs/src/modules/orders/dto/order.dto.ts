import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from '../../products/dto/product.dto';

const ORDER_STATUSES = [
  'created',
  'processing',
  'courier_picked_up',
  'in_delivery',
  'arrived',
  'completed',
  'cancelled',
] as const;

const STATUS_SOURCES = ['cron', 'client', 'admin'] as const;

/** Позиция заказа (с товаром и ценой на момент покупки). */
export class OrderItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty({ description: 'Цена позиции на момент заказа, в копейках' })
  priceSnapshot!: number;

  @ApiProperty()
  quantity!: number;

  @ApiProperty({ type: ProductDto })
  product!: ProductDto;
}

/** Запись истории смены статуса заказа. */
export class OrderStatusHistoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty({ enum: ORDER_STATUSES })
  status!: (typeof ORDER_STATUSES)[number];

  @ApiProperty({ enum: STATUS_SOURCES })
  source!: (typeof STATUS_SOURCES)[number];

  @ApiProperty({ type: String, format: 'date-time' })
  changedAt!: Date;
}

/** Общие поля заказа. */
class OrderBaseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ORDER_STATUSES })
  status!: (typeof ORDER_STATUSES)[number];

  @ApiProperty({ description: 'Сумма товаров в копейках' })
  totalAmount!: number;

  @ApiProperty({ description: 'Стоимость доставки в копейках' })
  deliveryAmount!: number;

  @ApiProperty()
  deliveryAddress!: string;

  @ApiProperty()
  deliveryLat!: number;

  @ApiProperty()
  deliveryLng!: number;

  @ApiProperty()
  estimatedDays!: number;

  @ApiProperty()
  refunded!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  cancelledAt!: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  completedAt!: Date | null;

  @ApiProperty({ type: [OrderItemDto] })
  items!: OrderItemDto[];
}

/** Заказ в списке (без истории статусов). */
export class OrderSummaryDto extends OrderBaseDto {}

/** Полный заказ (ответ create/findOne/cancel) — с историей статусов. */
export class OrderDto extends OrderBaseDto {
  @ApiProperty({ type: [OrderStatusHistoryDto] })
  history!: OrderStatusHistoryDto[];
}

/** Пагинированный список заказов (ответ GET /orders). */
export class OrderListDto {
  @ApiProperty({ type: [OrderSummaryDto] })
  items!: OrderSummaryDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}
