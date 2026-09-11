import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';

export class AddCartItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(0) // 0 = удалить позицию
  quantity!: number;
}

class MergeItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class MergeCartDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MergeItemDto)
  items!: MergeItemDto[];
}
