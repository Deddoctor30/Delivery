import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getDiscountedProducts,
  getPopularProducts,
  getProductById,
  getProducts,
  getSeasonalProducts,
  getSimilarProducts,
  type GetProductsParams,
} from "./products";
import { Product } from "../model/types";

export function usePopularProducts(limit = 8) {
  return useQuery({
    queryKey: ["products", "popular", limit],
    queryFn: () => getPopularProducts(limit),
  });
}

export function useSeasonalProducts(limit = 8) {
  return useQuery({
    queryKey: ["products", "seasonal", limit],
    queryFn: () => getSeasonalProducts(limit),
  });
}

export function useDiscountedProducts(limit = 8) {
  return useQuery({
    queryKey: ["products", "discounted", limit],
    queryFn: () => getDiscountedProducts(limit),
  });
}

export function useProducts(params: GetProductsParams = {}) {
  return useQuery({ queryKey: ["products", "list", params], queryFn: () => getProducts(params) });
}

export function useInfiniteProducts(params: GetProductsParams = {}) {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", params],
    queryFn: ({ pageParam }) => getProducts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", "detail", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
}

export function useSimilarProducts(product?: Pick<Product, "id" | "category">, limit = 6) {
  return useQuery({
    queryKey: ["products", "similar", product?.id],
    queryFn: () => getSimilarProducts(product!, limit),
    enabled: !!product,
  });
}
