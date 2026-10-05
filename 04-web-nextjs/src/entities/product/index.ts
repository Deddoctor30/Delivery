export type { Product } from "./model/types";
export { ProductCard } from "./ui/product-card";
export type { ProductCardProps } from "./ui/product-card";

// API-слой (server-only фетчеры)
export {
  getProducts,
  getProductById,
  getPopularProducts,
  searchProducts,
  getSimilarProducts,
  toProduct,
} from "./api/products";
export type { GetProductsParams } from "./api/products";

// Временный sync-доступ к mock-данным для cart/checkout.
// TODO: удалить после /make-api cart.
export { getProductById as getMockProductById, MOCK_PRODUCTS } from "./model/mock";
