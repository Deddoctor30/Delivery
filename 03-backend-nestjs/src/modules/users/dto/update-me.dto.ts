import { IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';

// набор преднастроенных аватаров (файлы в static/avatars/)
export const AVATAR_IDS = [
  'avatar-1', 'avatar-2', 'avatar-3', 'avatar-4',
  'avatar-5', 'avatar-6', 'avatar-7', 'avatar-8',
];

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
