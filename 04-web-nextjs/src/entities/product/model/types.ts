export type Product = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  discountPercent?: number;
  inStock?: boolean;
};
