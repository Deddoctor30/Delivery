import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto';

/** Пагинированный список пользователей (ответ GET /admin/users). */
export class AdminUserListDto {
  @ApiProperty({ type: [UserDto] })
  items!: UserDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}
