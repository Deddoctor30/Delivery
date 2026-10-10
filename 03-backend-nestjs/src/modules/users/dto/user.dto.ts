import { ApiProperty } from '@nestjs/swagger';

const ROLES = ['CLIENT', 'ADMIN'] as const;

/** Публичный профиль пользователя (без passwordHash). Ответ GET/PATCH /users/me. */
export class UserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ nullable: true })
  firstName!: string | null;

  @ApiProperty({ nullable: true })
  lastName!: string | null;

  @ApiProperty({ nullable: true })
  phone!: string | null;

  @ApiProperty({ nullable: true })
  avatarId!: string | null;

  @ApiProperty({ enum: ROLES })
  role!: (typeof ROLES)[number];

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}
