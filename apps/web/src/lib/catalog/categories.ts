export type Category = {
  documentId: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: { url: string } | null;
  parent: { documentId: string } | null;
};
export const categoryHref = (slug: string) => `/catalog/${encodeURIComponent(slug)}`;

/** Flat parent links support future subclasses without a fixed GraphQL nesting depth. */
export function categoryScope(categories: Category[], root: Category): Category[] {
  const ids = new Set([root.documentId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const category of categories) {
      if (category.parent && ids.has(category.parent.documentId) && !ids.has(category.documentId)) {
        ids.add(category.documentId);
        changed = true;
      }
    }
  }
  return categories.filter(category => ids.has(category.documentId));
}
export function categoryAncestors(categories: Category[], category: Category): Category[] {
  const result: Category[] = [];
  const seen = new Set([category.documentId]);
  let parent = category.parent;
  while (parent && !seen.has(parent.documentId)) {
    const item = categories.find(c => c.documentId === parent?.documentId);
    if (!item) break;
    seen.add(item.documentId);
    result.unshift(item);
    parent = item.parent;
  }
  return result;
}
