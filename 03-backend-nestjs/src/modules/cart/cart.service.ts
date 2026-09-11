import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AddCartItemDto, MergeCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // цена к оплате: скидочная, если есть, иначе базовая
  private effectivePrice(product: Product): number {
    return product.discountPrice ?? product.price;
  }

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { id: 'asc' },
    });

    const total = items.reduce(
      (sum, item) => sum + this.effectivePrice(item.product) * item.quantity,
      0,
    );

    return { items, total };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) {
      throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
    }

    const existing = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId: dto.productId } },
    });
    const newQuantity = (existing?.quantity ?? 0) + dto.quantity;

    if (newQuantity > product.stock) {
      throw new ConflictException({ code: 'INSUFFICIENT_STOCK', message: 'Not enough stock' });
    }

    await this.prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId: dto.productId } },
      update: { quantity: newQuantity },
      create: { userId, productId: dto.productId, quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    if (quantity === 0) {
      return this.removeItem(userId, productId);
    }

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
    }
    if (quantity > product.stock) {
      throw new ConflictException({ code: 'INSUFFICIENT_STOCK', message: 'Not enough stock' });
    }

    try {
      await this.prisma.cartItem.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException({ code: 'CART_ITEM_NOT_FOUND', message: 'Item not in cart' });
      }
      throw e;
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    // deleteMany не бросает, если позиции нет — идемпотентно
    await this.prisma.cartItem.deleteMany({ where: { userId, productId } });
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return this.getCart(userId);
  }

  // слияние гостевой корзины после логина
  async merge(userId: string, dto: MergeCartDto) {
    await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue; // неизвестный товар из localStorage — молча пропускаем

        const existing = await tx.cartItem.findUnique({
          where: { userId_productId: { userId, productId: item.productId } },
        });
        // суммируем с уже существующим, но не выше остатка на складе
        const quantity = Math.min((existing?.quantity ?? 0) + item.quantity, product.stock);

        await tx.cartItem.upsert({
          where: { userId_productId: { userId, productId: item.productId } },
          update: { quantity },
          create: { userId, productId: item.productId, quantity },
        });
      }
    });

    return this.getCart(userId);
  }
}
