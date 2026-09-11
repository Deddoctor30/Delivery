import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

type CategoryNode = Category & { children: CategoryNode[] };

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // всё дерево одним запросом + сборка в памяти
  async findTree(): Promise<CategoryNode[]> {
    const all = await this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return this.buildTree(all);
  }

  // категория по slug + её прямые дети
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { children: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!category) {
      throw new NotFoundException({ code: 'CATEGORY_NOT_FOUND', message: 'Category not found' });
    }
    return category;
  }

  private buildTree(categories: Category[]): CategoryNode[] {
    const byId = new Map<string, CategoryNode>();
    for (const c of categories) {
      byId.set(c.id, { ...c, children: [] });
    }

    const roots: CategoryNode[] = [];
    for (const node of byId.values()) {
      if (node.parentId) {
        // родитель уже в Map (порядок вставки не важен — сначала кладём все)
        byId.get(node.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }
}
