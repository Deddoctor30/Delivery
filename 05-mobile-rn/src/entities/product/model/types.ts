export type Product = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  discountPercent?: number;
  inStock?: boolean;
  category?: string;
  images?: string[];
  description?: string;
  brand?: string;
};
