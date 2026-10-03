export type Product = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  discountPercent?: number;
  inStock?: boolean;
  /** Идентификатор категории (совпадает с id в CategoryNav: electronics, clothing, …). */
  category?: string;
  /** Галерея фотографий товара (URL-ы). Если не задан — используется imageUrl. */
  images?: string[];
  /** Текстовое описание товара. */
  description?: string;
  /** Характеристики товара в виде пар ключ-значение. */
  specs?: { label: string; value: string }[];
  /** Средняя оценка (0–5). */
  rating?: number;
  /** Количество отзывов. */
  reviewsCount?: number;
  /** Бренд / производитель. */
  brand?: string;
};
