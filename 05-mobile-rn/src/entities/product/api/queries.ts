import { useQuery } from "@tanstack/react-query";

import {
  getDiscountedProducts,
  getPopularProducts,
  getProducts,
  getSeasonalProducts,
  type GetProductsParams,
} from "./products";

export function usePopularProducts(limit = 8) {
  return useQuery({ queryKey: ["products", "popular", limit], queryFn: () => getPopularProducts(limit) });
}

export function useSeasonalProducts(limit = 8) {
  return useQuery({ queryKey: ["products", "seasonal", limit], queryFn: () => getSeasonalProducts(limit) });
}

export function useDiscountedProducts(limit = 8) {
  return useQuery({ queryKey: ["products", "discounted", limit], queryFn: () => getDiscountedProducts(limit) });
}

export function useProducts(params: GetProductsParams = {}) {
  return useQuery({ queryKey: ["products", "list", params], queryFn: () => getProducts(params) });
}
