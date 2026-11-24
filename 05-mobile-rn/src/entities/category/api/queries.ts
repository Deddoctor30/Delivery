import { useQuery } from "@tanstack/react-query";

import { getTopCategories } from "./categories";

export function useTopCategories() {
  return useQuery({
    queryKey: ["categories", "top"],
    queryFn: getTopCategories,
    staleTime: 60 * 60 * 1000, // категории меняются редко — час
  });
}
