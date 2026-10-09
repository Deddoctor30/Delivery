import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Список адресов пользователя: основной сверху, затем свежие. */
  list(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(userId: string, dto: CreateAddressDto) {
    const count = await this.prisma.address.count({ where: { userId } });
    // первый адрес всегда основной; иначе — по флагу
    const makeDefault = count === 0 || dto.isDefault === true;

    await this.prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      await tx.address.create({
        data: {
          userId,
          label: dto.label,
          city: dto.city,
          street: dto.street,
          apt: dto.apt,
          zip: dto.zip,
          comment: dto.comment,
          lat: dto.lat,
          lng: dto.lng,
          isDefault: makeDefault,
        },
      });
    });

    return this.list(userId);
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    await this.ensureOwner(userId, id);

    await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault === true) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      await tx.address.update({
        where: { id },
        data: {
          label: dto.label,
          city: dto.city,
          street: dto.street,
          apt: dto.apt,
          zip: dto.zip,
          comment: dto.comment,
          lat: dto.lat,
          lng: dto.lng,
          isDefault: dto.isDefault,
        },
      });
    });

    return this.list(userId);
  }

  async remove(userId: string, id: string) {
    const removed = await this.prisma.address.deleteMany({ where: { id, userId } });
    // если удалили основной — назначаем основным самый свежий из оставшихся
    if (removed.count > 0) {
      const hasDefault = await this.prisma.address.findFirst({ where: { userId, isDefault: true } });
      if (!hasDefault) {
        const latest = await this.prisma.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        if (latest) {
          await this.prisma.address.update({ where: { id: latest.id }, data: { isDefault: true } });
        }
      }
    }
    return this.list(userId);
  }

  async setDefault(userId: string, id: string) {
    await this.ensureOwner(userId, id);
    await this.prisma.$transaction([
      this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
      this.prisma.address.update({ where: { id }, data: { isDefault: true } }),
    ]);
    return this.list(userId);
  }

  private async ensureOwner(userId: string, id: string) {
    try {
      const address = await this.prisma.address.findUniqueOrThrow({ where: { id } });
      if (address.userId !== userId) {
        throw new NotFoundException({ code: 'ADDRESS_NOT_FOUND', message: 'Address not found' });
      }
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException({ code: 'ADDRESS_NOT_FOUND', message: 'Address not found' });
      }
      throw e;
    }
  }
}
