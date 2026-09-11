import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

type PublicUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit: { passwordHash: true }, // Prisma сам вырежет поле на уровне запроса
    });
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }
    return user;
  }

  async updateMe(userId: string, dto: UpdateMeDto): Promise<PublicUser> {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: dto,
        omit: { passwordHash: true },
      });
    } catch (e) {
      // phone @unique — при занятом телефоне Prisma кинет P2002
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException({ code: 'PHONE_TAKEN', message: 'Phone already in use' });
      }
      throw e;
    }
  }
}
