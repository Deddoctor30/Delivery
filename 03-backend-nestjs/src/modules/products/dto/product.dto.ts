import { ApiProperty } from '@nestjs/swagger';

/**
 * Форма товара в ответах API (документирует OpenAPI-схему).
 * Повторяет Prisma-модель Product. Сервис возвращает Prisma-объект —
 * DTO нужен для генерации схемы ответа (openapi-typescript → фронт).
 */
export class ProductDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ description: 'Цена в копейках' })
  price!: number;

  @ApiProperty({ type: Number, nullable: true, description: 'Скидочная цена в копейках' })
  discountPrice!: number | null;

  @ApiProperty()
  imageUrl!: string;

  @ApiProperty()
  stock!: number;

  @ApiProperty()
  isPopular!: boolean;

  @ApiProperty()
  isSeasonal!: boolean;

  @ApiProperty({ type: String, nullable: true })
  season!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}
