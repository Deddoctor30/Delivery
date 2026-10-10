import { IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';

// набор преднастроенных аватаров (файлы в static/avatars/{id}.webp)
export const AVATAR_IDS = ['avatar-male', 'avatar-female'];

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  lastName?: string;

  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'phone must be a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsIn(AVATAR_IDS)
  avatarId?: string;
}
