import { ApiProperty } from '@nestjs/swagger';

/** Элемент автокомплита (ответ GET /products/search/suggest). */
export class SuggestItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ description: 'Похожесть по триграммам (pg_trgm)' })
  sim!: number;
}
