import { mediaUrl } from "@/lib/client";

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

/** Category photo, or a matching static picture until one is uploaded in the CMS. */
export function categoryImage(category: Category, categories: Category[]): string {
  if (category.image?.url) return mediaUrl(category.image.url);
  const name = `${category.name} ${category.slug}`.toLowerCase();
  if (/spc|спс/.test(name)) return "/images/home/spc.png";
  if (/вініл|vinyl|vinil/.test(name)) return "/images/home/vinyl.png";
  if (/ламінат|laminat/.test(name)) return "/images/home/laminate.png";
  const path = [...categoryAncestors(categories, category), category]
    .map(item => `${item.name} ${item.slug}`).join(" ").toLowerCase();
  if (/двер|dver|doors|mizhkimnat|vhidni/.test(path)) return "/images/home/doors.png";
  if (/підлог|pidloh|floor/.test(path)) return "/images/home/laminate.png";
  return "/images/home/hero.png";
}
