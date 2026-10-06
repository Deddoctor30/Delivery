export type { Category } from "./model/types";

// API-слой (server-only фетчеры)
export {
  getCategoryTree,
  getTopCategories,
  getCategoryById,
  getCategoryBySlug,
  toCategory,
} from "./api/categories";
