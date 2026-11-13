export type { Product } from "./model/types";
export {
  getProducts,
  getProductById,
  getPopularProducts,
  type GetProductsParams,
} from "./api/products";
export { useProducts, usePopularProducts } from "./api/queries";
