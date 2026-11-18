export {
  getDiscountedProducts,
  getPopularProducts,
  getProductById,
  getProducts,
  getSeasonalProducts,
  type GetProductsParams,
} from "./api/products";
export {
  useDiscountedProducts,
  usePopularProducts,
  useProducts,
  useSeasonalProducts,
} from "./api/queries";
export type { Product } from "./model/types";
export { ProductCard } from "./ui/product-card";
