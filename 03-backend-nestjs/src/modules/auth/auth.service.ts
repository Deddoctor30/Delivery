import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginOrRegisterDto } from './dto/login-or-register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SessionService, TokenPair } from './session.service';
import { AuthUser } from './types';

type PublicUser = Omit<User, 'passwordHash'>;

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
  ) {}

  // mode='login' — только существующий аккаунт; mode='register' — только новый;
  // без mode — старое поведение (есть юзер → логин, нет → регистрация).
  async loginOrRegister(dto: LoginOrRegisterDto): Promise<TokenPair & { user: PublicUser }> {
    const email = dto.email.toLowerCase().trim();
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (dto.mode === 'register') {
      if (user) {
        throw new ConflictException({
          code: 'EMAIL_TAKEN',
          message: 'Email already registered',
        });
      }
      user = await this.createUser(email, dto.password);
    } else if (dto.mode === 'login') {
      if (!user) {
        throw new UnauthorizedException({
          code: 'USER_NOT_FOUND',
          message: 'Account not found',
        });
      }
      await this.assertPassword(dto.password, user.passwordHash);
    } else {
      // legacy: есть юзер → логин (сверяем пароль), нет → регистрация
      if (user) {
        await this.assertPassword(dto.password, user.passwordHash);
      } else {
        user = await this.createUser(email, dto.password);
      }
    }

    const pair = await this.sessions.createSession(user.id, user.role);
    return { ...pair, user: this.toPublic(user) };
  }

  private async createUser(email: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    return this.prisma.user.create({
      data: { email, passwordHash, role: Role.CLIENT },
    });
  }

  private async assertPassword(password: string, passwordHash: string): Promise<void> {
    const ok = await bcrypt.compare(password, passwordHash);
    if (!ok) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }
  }

  // ротация пары по refresh + sessionId (reuse-detection живёт в SessionService)
  async refresh(dto: RefreshDto): Promise<TokenPair> {
    return this.sessions.rotate(dto.sessionId, dto.refreshToken);
  }

  // выход из текущей сессии
  async logout(principal: AuthUser): Promise<void> {
    await this.sessions.revokeSession(
      principal.jti,
      principal.exp,
      principal.sid,
      principal.userId,
    );
  }

  // выйти со всех устройств
  async logoutAll(userId: string): Promise<void> {
    await this.sessions.revokeAll(userId);
  }

  // смена пароля: сверяем текущий, хешируем новый, выкидываем остальные сессии
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) {
      throw new BadRequestException({
        code: 'WRONG_PASSWORD',
        message: 'Текущий пароль неверный',
      });
    }
    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException({
        code: 'SAME_PASSWORD',
        message: 'Новый пароль совпадает с текущим',
      });
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    // Текущие сессии намеренно не трогаем — пользователь остаётся залогинен в этом окне.
  }

  // профиль для GET /auth/me
  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }
    return this.toPublic(user);
  }

  // никогда не отдаём passwordHash наружу
  private toPublic(user: User): PublicUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _omit, ...pub } = user;
    return pub;
  }
}
