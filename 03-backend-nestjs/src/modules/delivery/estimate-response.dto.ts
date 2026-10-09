import { ApiProperty } from '@nestjs/swagger';

/** Результат расчёта доставки (ответ POST /delivery/estimate). */
export class DeliveryEstimateDto {
  @ApiProperty({ description: 'Расстояние по прямой до точки, км' })
  distanceKm!: number;

  @ApiProperty({ description: 'Ожидаемый срок доставки, дней' })
  estimatedDays!: number;

  @ApiProperty({ description: 'Стоимость доставки, в копейках' })
  deliveryAmount!: number;
}
