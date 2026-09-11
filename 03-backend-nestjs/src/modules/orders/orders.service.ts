import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusChangeSource } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AuthUser } from '../auth/types';
import { DeliveryService } from '../delivery/delivery.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { canTransition } from './state-machine';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly delivery: DeliveryService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    if (cartItems.length === 0) {
      throw new BadRequestException({ code: 'EMPTY_CART', message: 'Cart is empty' });
    }

    // чистая функция — считаем до транзакции
    const estimate = this.delivery.estimate(dto.deliveryLat, dto.deliveryLng);
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.quantity,
      0,
    );

    // весь заказ — атомарно: либо целиком, либо откат
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          status: 'created',
          totalAmount,
          deliveryAmount: estimate.deliveryAmount,
          deliveryAddress: dto.deliveryAddress,
          deliveryLat: dto.deliveryLat,
          deliveryLng: dto.deliveryLng,
          estimatedDays: estimate.estimatedDays,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              priceSnapshot: item.product.discountPrice ?? item.product.price,
              quantity: item.quantity,
            })),
          },
          history: {
            create: { status: 'created', source: 'client' },
          },
        },
        include: { items: true, history: true },
      });

      // корзину опустошаем
      await tx.cartItem.deleteMany({ where: { userId } });
      return order;
    });
  }

  async findOne(id: string, user: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        history: { orderBy: { changedAt: 'asc' } },
      },
    });
    if (!order) {
      throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
    }
    // владелец или админ
    if (order.userId !== user.userId && user.role !== 'ADMIN') {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Not your order' });
    }
    return order;
  }

  async findMany(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { items: true },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async cancel(id: string, user: AuthUser, source: StatusChangeSource = 'client') {
    const order = await this.findOne(id, user); // включает проверку владельца

    if (!canTransition(order.status, 'cancelled')) {
      throw new ConflictException({
        code: 'ORDER_NOT_CANCELLABLE',
        message: `Order in status "${order.status}" cannot be cancelled`,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status: 'cancelled', refunded: true, cancelledAt: new Date() },
      });
      await tx.orderStatusHistory.create({
        data: { orderId: id, status: 'cancelled', source },
      });
      return updated;
    });
  }
}
