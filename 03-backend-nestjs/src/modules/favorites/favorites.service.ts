import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Избранные товары пользователя (для грида в ЛК). */
  async list(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return { items: favorites.map((f) => f.product) };
  }

  /** Набор id избранного — для инициализации/синка клиентского стора. */
  async ids(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { productId: true },
    });
    return { ids: favorites.map((f) => f.productId) };
  }

  async add(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
    }
    // upsert — идемпотентно, повторное добавление не падает
    await this.prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });
    return this.ids(userId);
  }

  async remove(userId: string, productId: string) {
    // deleteMany не бросает, если записи нет — идемпотентно
    await this.prisma.favorite.deleteMany({ where: { userId, productId } });
    return this.ids(userId);
  }
}
