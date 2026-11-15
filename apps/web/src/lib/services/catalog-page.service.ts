import { categoryAncestors, categoryScope } from "@/lib/catalog/categories";
import { getCategories } from "@/lib/services/category.service";
import { getFilters } from "@/lib/services/catalog.service";

/**
 * Category, its subcategory scope and filters: shared by the catalog page and the "load more" API.
 * The API passes `details: false`: it only applies filters, so value popularity and price bounds are skipped.
 */
export async function getCatalogContext(slug: string, { details = true }: { details?: boolean } = {}) {
  const categories = await getCategories();
  const current = categories.find(item => item.slug === slug);
  if (!current) return null;
  const scope = categoryScope(categories, current).map(item => item.slug);
  const ancestors = categoryAncestors(categories, current);
  const filters = await getFilters([...new Set([...scope, ...ancestors.map(item => item.slug)])], scope, { details });
  return { categories, current, scope, ancestors, filters };
}
