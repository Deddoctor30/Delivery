import type { Product } from "./types";

/**
 * Единый временный mock-каталог товаров.
 *
 * TODO: заменить на реальный API (apiServer из @/shared/api/server).
 * Пока это единственный источник товаров для всех экранов (каталог, главная,
 * страница товара, похожие) — чтобы id были консистентны и ссылки работали.
 */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Наушники Sound X3",
    price: 4990,
    oldPrice: 6100,
    discountPercent: 18,
    inStock: true,
    category: "electronics",
    brand: "SoundTech",
    rating: 4.8,
    reviewsCount: 312,
    description:
      "Sound X3 — флагманские беспроводные наушники с активным шумоподавлением второго поколения. Сценарии прозрачности, адаптивный профиль звука и автономность до 36 часов превращают каждое путешествие в премиальный аудиоопыт.",
    specs: [
      { label: "Тип", value: "Накладные" },
      { label: "Шумоподавление", value: "ANC до −38 dB" },
      { label: "Автономность", value: "до 36 ч" },
      { label: "Bluetooth", value: "5.3 · multipoint" },
      { label: "Зарядка", value: "USB-C, 10 мин = 4 ч" },
      { label: "Вес", value: "268 г" },
    ],
  },
  {
    id: "p2",
    title: "Робот-пылесос Vac Pro",
    price: 19800,
    inStock: true,
    category: "home",
    brand: "CleanBot",
    rating: 4.5,
    reviewsCount: 87,
    description:
      "Vac Pro — умный робот-пылесос с лидарной навигацией и влажной уборкой. Строит точные карты помещения, обходит препятствия и возвращается на базу самостоятельно.",
    specs: [
      { label: "Навигация", value: "Лидар LDS" },
      { label: "Мощность всасывания", value: "3000 Па" },
      { label: "Резервуар для воды", value: "300 мл" },
      { label: "Автономность", value: "до 180 мин" },
      { label: "Уровень шума", value: "55 дБ" },
    ],
  },
  {
    id: "p3",
    title: "Чайник Smart 1.7л",
    price: 2490,
    oldPrice: 2990,
    discountPercent: 17,
    inStock: true,
    category: "home",
    brand: "HomeLife",
    rating: 4.2,
    reviewsCount: 44,
    specs: [
      { label: "Объём", value: "1.7 л" },
      { label: "Мощность", value: "2200 Вт" },
      { label: "Материал", value: "Нержавеющая сталь" },
      { label: "Индикатор уровня воды", value: "Есть" },
    ],
  },
  {
    id: "p4",
    title: "Кофемашина CremaOne",
    price: 32900,
    inStock: true,
    category: "home",
    brand: "CremaLab",
    rating: 4.9,
    reviewsCount: 201,
    description:
      "CremaOne — рожковая кофемашина с профессиональным давлением 15 бар и капучинатором. Готовит эспрессо, американо и напитки на молоке одним касанием.",
    specs: [
      { label: "Тип", value: "Рожковая" },
      { label: "Давление", value: "15 бар" },
      { label: "Мощность", value: "1450 Вт" },
      { label: "Резервуар", value: "1.8 л" },
    ],
  },
  {
    id: "p5",
    title: "Смартфон Pixel 9",
    price: 74990,
    oldPrice: 84990,
    discountPercent: 12,
    inStock: true,
    category: "electronics",
    brand: "Google",
    rating: 4.7,
    reviewsCount: 538,
    description:
      "Pixel 9 — смартфон с лучшей вычислительной фотографией и чистым Android. Чип Tensor, яркий OLED-дисплей и 7 лет обновлений.",
    specs: [
      { label: "Экран", value: '6.3" OLED 120 Гц' },
      { label: "Процессор", value: "Tensor G4" },
      { label: "Память", value: "12 / 256 ГБ" },
      { label: "Камера", value: "50 Мп + 48 Мп" },
      { label: "Батарея", value: "4700 мА·ч" },
    ],
  },
  {
    id: "p6",
    title: "Планшет Slate 11",
    price: 38500,
    inStock: true,
    category: "electronics",
    brand: "Slate",
    rating: 4.3,
    reviewsCount: 76,
    specs: [
      { label: "Экран", value: '11" IPS 2.2K' },
      { label: "Память", value: "8 / 128 ГБ" },
      { label: "Батарея", value: "8000 мА·ч" },
      { label: "Стилус", value: "Поддерживается" },
    ],
  },
  {
    id: "p7",
    title: "Наушники Bass M2",
    price: 7990,
    oldPrice: 9990,
    discountPercent: 20,
    inStock: true,
    category: "electronics",
    brand: "BassLine",
    rating: 4.1,
    reviewsCount: 129,
    specs: [
      { label: "Тип", value: "Внутриканальные" },
      { label: "Автономность", value: "до 28 ч" },
      { label: "Защита", value: "IPX5" },
      { label: "Bluetooth", value: "5.2" },
    ],
  },
  {
    id: "p8",
    title: "Колонка Boom 5",
    price: 5490,
    inStock: true,
    category: "electronics",
    brand: "Boom",
    rating: 4.6,
    reviewsCount: 263,
    specs: [
      { label: "Мощность", value: "30 Вт" },
      { label: "Автономность", value: "до 20 ч" },
      { label: "Защита", value: "IP67" },
      { label: "Bluetooth", value: "5.3" },
    ],
  },
  {
    id: "p9",
    title: "Часы Move 2",
    price: 14990,
    oldPrice: 17990,
    discountPercent: 17,
    inStock: true,
    category: "electronics",
    brand: "Move",
    rating: 4.4,
    reviewsCount: 158,
    specs: [
      { label: "Экран", value: "AMOLED 1.4”" },
      { label: "Автономность", value: "до 14 дней" },
      { label: "Датчики", value: "пульс, SpO₂, GPS" },
      { label: "Защита", value: "5 ATM" },
    ],
  },
  {
    id: "p10",
    title: "Камера Pro 4K",
    price: 54900,
    inStock: false,
    category: "electronics",
    brand: "OptiCam",
    rating: 4.8,
    reviewsCount: 64,
    specs: [
      { label: "Матрица", value: "APS-C 26 Мп" },
      { label: "Видео", value: "4K 60 fps" },
      { label: "Стабилизация", value: "5-осевая" },
      { label: "Экран", value: "поворотный сенсор" },
    ],
  },
  {
    id: "p11",
    title: "Микрофон Voice X",
    price: 9990,
    inStock: true,
    category: "electronics",
    brand: "Voice",
    rating: 4.5,
    reviewsCount: 98,
    specs: [
      { label: "Тип", value: "Конденсаторный USB" },
      { label: "Направленность", value: "Кардиоида" },
      { label: "Частота", value: "20 Гц – 20 кГц" },
      { label: "Разъём", value: "USB-C" },
    ],
  },
  {
    id: "p12",
    title: "Power Bank 20K",
    price: 2990,
    oldPrice: 3490,
    discountPercent: 14,
    inStock: true,
    category: "electronics",
    brand: "Volt",
    rating: 4.3,
    reviewsCount: 412,
    specs: [
      { label: "Ёмкость", value: "20 000 мА·ч" },
      { label: "Выход", value: "USB-C PD 30 Вт" },
      { label: "Быстрая зарядка", value: "Есть" },
    ],
  },
  {
    id: "p13",
    title: "Куртка Winter Pro",
    price: 6490,
    oldPrice: 9200,
    discountPercent: 29,
    inStock: true,
    category: "clothing",
    brand: "NordWear",
    rating: 4.6,
    reviewsCount: 143,
    specs: [
      { label: "Утеплитель", value: "Синтепух 250 г" },
      { label: "Мембрана", value: "10 000 мм" },
      { label: "Температура", value: "до −25 °C" },
    ],
  },
  {
    id: "p14",
    title: "Кроссовки Run Pro",
    price: 5490,
    oldPrice: 6990,
    discountPercent: 21,
    inStock: true,
    category: "sport",
    brand: "Strider",
    rating: 4.7,
    reviewsCount: 329,
    specs: [
      { label: "Назначение", value: "Бег по асфальту" },
      { label: "Вес", value: "245 г" },
      { label: "Амортизация", value: "Пена EVA+" },
    ],
  },
  {
    id: "p15",
    title: "Книга «Эссенциализм»",
    price: 890,
    oldPrice: 1200,
    discountPercent: 26,
    inStock: true,
    category: "books",
    brand: "Манн, Иванов и Фербер",
    rating: 4.8,
    reviewsCount: 1024,
    description:
      "«Эссенциализм» Грега МакКеона — о том, как сфокусироваться на действительно важном и перестать распыляться. Бестселлер о дисциплине меньшего.",
    specs: [
      { label: "Автор", value: "Грег МакКеон" },
      { label: "Страниц", value: "320" },
      { label: "Переплёт", value: "Твёрдый" },
    ],
  },
  {
    id: "p16",
    title: "Гантели 2×8 кг",
    price: 3290,
    oldPrice: 4100,
    discountPercent: 20,
    inStock: true,
    category: "sport",
    brand: "IronFit",
    rating: 4.5,
    reviewsCount: 187,
    specs: [
      { label: "Вес", value: "2 × 8 кг" },
      { label: "Покрытие", value: "Обрезиненное" },
      { label: "Тип", value: "Разборные" },
    ],
  },
];

/** Найти товар по id. */
export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}

/**
 * Похожие товары: сначала из той же категории (кроме самого товара),
 * затем добираем остальными до limit.
 */
export function getSimilarProducts(id: string, limit = 4): Product[] {
  const current = getProductById(id);
  const sameCategory = MOCK_PRODUCTS.filter(
    (p) => p.id !== id && current?.category != null && p.category === current.category,
  );
  const rest = MOCK_PRODUCTS.filter((p) => p.id !== id && !sameCategory.includes(p));
  return [...sameCategory, ...rest].slice(0, limit);
}
