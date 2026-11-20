export {
  getDiscountedProducts,
  getPopularProducts,
  getProductById,
  getProducts,
  getSeasonalProducts,
  getSimilarProducts,
  type GetProductsParams,
} from "./api/products";
export {
  useDiscountedProducts,
  useInfiniteProducts,
  usePopularProducts,
  useProduct,
  useProducts,
  useSeasonalProducts,
  useSimilarProducts,
} from "./api/queries";
export type { Product } from "./model/types";
export { ProductCard } from "./ui/product-card";
