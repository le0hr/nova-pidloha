import Image from "next/image";
import Link from "next/link";
import { categoryAncestors, categoryHref, type Category } from "@/lib/catalog/categories";
import { mediaUrl } from "@/lib/client";

function categoryImage(category: Category, categories: Category[]): string {
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

export default function SubclassSelector({ categories, current }: { categories: Category[]; current: Category }) {
  const children = categories.filter(item => item.parent?.documentId === current.documentId);
  const parent = categories.find(item => item.documentId === current.parent?.documentId);
  const root = children.length ? current : parent;
  if (!root) return null;
  const subclasses = children.length ? children : categories.filter(item => item.parent?.documentId === root.documentId);
  if (!subclasses.length) return null;

  return (
    <nav aria-label={`Підкатегорії: ${root.name}`} className="min-w-0 border-b border-[#e0e0e0] pb-5 md:pb-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-[#1a1a1a]">Оберіть категорію</h2>
        {root.documentId !== current.documentId && <Link href={categoryHref(root.slug)} className="text-xs font-semibold text-[#e53935] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e53935]">Усі товари: {root.name} <span aria-hidden="true">↗</span></Link>}
      </div>
      <div className="flex snap-x snap-proximity gap-3 overflow-x-auto pb-2 md:gap-4">
        {[root, ...subclasses].map((category, index) => {
          const selected = current.documentId === category.documentId;
          return <Link key={category.documentId} href={categoryHref(category.slug)} aria-current={selected ? "page" : undefined}
            className={`group w-[144px] shrink-0 snap-start overflow-hidden border bg-white transition-colors md:w-[184px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#e53935] ${selected ? "border-[#e53935]" : "border-[#e0e0e0] hover:border-[#e53935]"}`}>
            <div className="relative h-[92px] overflow-hidden bg-[#f5f5f5] md:h-[116px]">
              <Image src={categoryImage(category, categories)} alt="" fill unoptimized sizes="184px" className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105" />
              {selected && <span aria-hidden="true" className="absolute right-2 top-2 flex size-6 items-center justify-center bg-[#e53935] text-sm text-white">✓</span>}
            </div>
            <div className={`flex min-h-12 items-center justify-between gap-2 px-3 py-2 text-xs font-semibold md:text-sm ${selected ? "bg-[#fff4f3] text-[#e53935]" : "text-[#1a1a1a] group-hover:text-[#e53935]"}`}>
              <span>{index === 0 ? `Усі: ${category.name}` : category.name}</span><span aria-hidden="true" className="shrink-0">↗</span>
            </div>
          </Link>;
        })}
      </div>
    </nav>
  );
}
