import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

// seed запускается вне Nest, поэтому клиент создаём здесь сами — с тем же driver adapter
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@delivery.local'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin12345';
const CLIENT_PASSWORD = 'password123';
const BCRYPT_ROUNDS = 12;

// дерево категорий: топ-категория → подкатегории
const categoryTree = [
  {
    slug: 'goryachee',
    name: 'Горячее',
    children: [
      { slug: 'pizza', name: 'Пицца' },
      { slug: 'burgers', name: 'Бургеры' },
      { slug: 'soups', name: 'Супы' },
    ],
  },
  {
    slug: 'napitki',
    name: 'Напитки',
    children: [
      { slug: 'coffee', name: 'Кофе' },
      { slug: 'lemonades', name: 'Лимонады' },
    ],
  },
  {
    slug: 'deserty',
    name: 'Десерты',
    children: [
      { slug: 'cakes', name: 'Торты' },
      { slug: 'ice-cream', name: 'Мороженое' },
    ],
  },
];

// цены в КОПЕЙКАХ
const products = [
  { slug: 'margherita', name: 'Пицца Маргарита', category: 'pizza', price: 45000, stock: 50, isPopular: true },
  { slug: 'pepperoni', name: 'Пицца Пепперони', category: 'pizza', price: 52000, discountPrice: 46000, stock: 40, isPopular: true },
  { slug: 'cheeseburger', name: 'Чизбургер', category: 'burgers', price: 32000, stock: 60 },
  { slug: 'double-burger', name: 'Двойной бургер', category: 'burgers', price: 41000, stock: 35, isPopular: true },
  { slug: 'borsch', name: 'Борщ', category: 'soups', price: 28000, stock: 25 },
  { slug: 'ramen', name: 'Рамен', category: 'soups', price: 39000, stock: 20, isSeasonal: true, season: 'winter' },
  { slug: 'cappuccino', name: 'Капучино', category: 'coffee', price: 18000, stock: 100, isPopular: true },
  { slug: 'latte', name: 'Латте', category: 'coffee', price: 19000, stock: 100 },
  { slug: 'lemonade-citrus', name: 'Лимонад Цитрус', category: 'lemonades', price: 22000, stock: 80, isSeasonal: true, season: 'summer' },
  { slug: 'napoleon', name: 'Торт Наполеон', category: 'cakes', price: 35000, stock: 15 },
  { slug: 'cheesecake', name: 'Чизкейк', category: 'cakes', price: 33000, discountPrice: 29000, stock: 18, isPopular: true },
  { slug: 'vanilla-ice', name: 'Мороженое Ваниль', category: 'ice-cream', price: 15000, stock: 90, isSeasonal: true, season: 'summer' },
];

async function seedCategories(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  let topOrder = 0;
  for (const top of categoryTree) {
    const parent = await prisma.category.upsert({
      where: { slug: top.slug },
      update: { name: top.name, sortOrder: topOrder },
      create: { slug: top.slug, name: top.name, sortOrder: topOrder },
    });
    ids.set(top.slug, parent.id);
    topOrder++;

    let childOrder = 0;
    for (const child of top.children) {
      const c = await prisma.category.upsert({
        where: { slug: child.slug },
        update: { name: child.name, parentId: parent.id, sortOrder: childOrder },
        create: { name: child.name, slug: child.slug, parentId: parent.id, sortOrder: childOrder },
      });
      ids.set(child.slug, c.id);
      childOrder++;
    }
  }
  return ids;
}

async function seedProducts(categories: Map<string, string>) {
  for (const p of products) {
    const categoryId = categories.get(p.category);
    if (!categoryId) throw new Error(`Unknown category slug: ${p.category}`);

    const data = {
      name: p.name,
      description: `${p.name} — вкусно и быстро.`,
      price: p.price,
      discountPrice: p.discountPrice ?? null,
      imageUrl: `/static/products/${p.slug}.webp`,
      stock: p.stock,
      isPopular: p.isPopular ?? false,
      isSeasonal: p.isSeasonal ?? false,
      season: p.season ?? null,
      categoryId,
    };

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
  }
}

async function seedUsers() {
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS),
      firstName: 'Admin',
      lastName: 'Delivery',
      role: 'ADMIN',
      avatarId: 'avatar-1',
    },
  });

  const clients = [
    { email: 'ivan@mail.ru', firstName: 'Иван', lastName: 'Иванов', avatarId: 'avatar-2' },
    { email: 'maria@mail.ru', firstName: 'Мария', lastName: 'Петрова', avatarId: 'avatar-3' },
  ];
  for (const c of clients) {
    await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        ...c,
        passwordHash: await bcrypt.hash(CLIENT_PASSWORD, BCRYPT_ROUNDS),
        role: 'CLIENT',
      },
    });
  }
}

async function main() {
  const categories = await seedCategories();
  await seedProducts(categories);
  await seedUsers();
  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
