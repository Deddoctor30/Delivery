export {
  getPopularProducts,
  getProductById,
  getProducts,
  type GetProductsParams,
} from "./api/products";
export { usePopularProducts, useProducts } from "./api/queries";
export type { Product } from "./model/types";
export { ProductCard } from "./ui/product-card";
