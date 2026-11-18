export interface Category {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  sortOrder: number;
  children: Category[];
}
