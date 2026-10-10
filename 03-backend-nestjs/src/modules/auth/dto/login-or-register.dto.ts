import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginOrRegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  // 'login' — только существующий аккаунт; 'register' — только новый.
  // Не задан — старое поведение login-or-register (для обратной совместимости).
  @IsOptional()
  @IsIn(['login', 'register'])
  mode?: 'login' | 'register';
}
