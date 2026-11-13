import { useQuery } from "@tanstack/react-query";

import { getPopularProducts, getProducts, type GetProductsParams } from "./products";

export function usePopularProducts(limit = 8) {
  return useQuery({
    queryKey: ["products", "popular", limit],
    queryFn: () => getPopularProducts(limit),
  });
}

export function useProducts(params: GetProductsParams = {}) {
  return useQuery({
    queryKey: ["products", "list", params],
    queryFn: () => getProducts(params),
  });
}
