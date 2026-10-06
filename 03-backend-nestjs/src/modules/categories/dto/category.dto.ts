import { ApiProperty } from '@nestjs/swagger';

/**
 * Форма категории в ответах API (документирует OpenAPI-схему).
 * Повторяет Prisma-модель Category. Сервис возвращает Prisma-объект —
 * DTO нужен для генерации схемы ответа (openapi-typescript → фронт).
 */
export class CategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: String, nullable: true })
  parentId!: string | null;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  sortOrder!: number;
}

/**
 * Узел дерева категорий (ответ GET /categories).
 * Рекурсивный: children — массив таких же узлов.
 */
export class CategoryTreeDto extends CategoryDto {
  @ApiProperty({ type: () => CategoryTreeDto, isArray: true })
  children!: CategoryTreeDto[];
}

/**
 * Категория по slug (ответ GET /categories/:slug) с прямыми детьми (один уровень).
 */
export class CategoryDetailDto extends CategoryDto {
  @ApiProperty({ type: () => CategoryDto, isArray: true })
  children!: CategoryDto[];
}
