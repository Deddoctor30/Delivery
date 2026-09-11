import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../core/prisma/prisma.service';
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

  // единая ручка: есть юзер → логин, нет → регистрация
  async loginOrRegister(dto: LoginOrRegisterDto): Promise<TokenPair & { user: PublicUser }> {
    const email = dto.email.toLowerCase().trim();
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      // логин: сверяем пароль
      const ok = await bcrypt.compare(dto.password, user.passwordHash);
      if (!ok) {
        throw new UnauthorizedException({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }
    } else {
      // регистрация: хешируем пароль, роль по умолчанию client
      const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
      user = await this.prisma.user.create({
        data: { email, passwordHash, role: Role.CLIENT },
      });
    }

    const pair = await this.sessions.createSession(user.id, user.role);
    return { ...pair, user: this.toPublic(user) };
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
