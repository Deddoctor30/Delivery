import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ProductQueryDto } from './dto/product-query.dto';

const ORDER_BY: Record<ProductQueryDto['sort'], Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  name: { name: 'asc' },
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: ProductQueryDto) {
    const where: Prisma.ProductWhereInput = {};
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.popular !== undefined) where.isPopular = query.popular;
    if (query.seasonal !== undefined) where.isSeasonal = query.seasonal;
    if (query.discounted) where.discountPrice = { not: null };
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const skip = (query.page - 1) * query.limit;

    // findMany + count в одной транзакции — консистентный total
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: ORDER_BY[query.sort],
        skip,
        take: query.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
    }
    return product;
  }

  popular(take = 10) {
    return this.prisma.product.findMany({
      where: { isPopular: true },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  // autocomplete через pg_trgm: похожесть по триграммам + ILIKE-фоллбек
  async suggest(q: string) {
    const query = q?.trim();
    if (!query || query.length < 2) return [];

    return this.prisma.$queryRaw<
      Array<{ id: string; name: string; slug: string; sim: number }>
    >`
      SELECT id, name, slug, similarity(name, ${query}) AS sim
      FROM "Product"
      WHERE name % ${query} OR name ILIKE ${'%' + query + '%'}
      ORDER BY sim DESC
      LIMIT 10
    `;
  }
}
