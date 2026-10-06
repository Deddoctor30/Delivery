/** Узел категории каталога (доменный тип). */
export interface Category {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  sortOrder: number;
  /** Прямые дети (пусто у листьев). Заполняется в дереве. */
  children: Category[];
}
