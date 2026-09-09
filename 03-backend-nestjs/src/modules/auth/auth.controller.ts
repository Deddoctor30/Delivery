import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginOrRegisterDto } from './dto/login-or-register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthUser } from './types';

@Controller('auth')
@UseGuards(ThrottlerGuard) // 5 req/min на IP ко всем /auth/* — против брутфорса
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login-or-register')
  @HttpCode(HttpStatus.OK)
  loginOrRegister(@Body() dto: LoginOrRegisterDto) {
    return this.auth.loginOrRegister(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user: AuthUser) {
    await this.auth.logout(user);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(@CurrentUser('userId') userId: string) {
    await this.auth.logoutAll(userId);
  }

  @Get('me')
  me(@CurrentUser('userId') userId: string) {
    return this.auth.me(userId);
  }
}
