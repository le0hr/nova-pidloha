"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { categoryHref, categoryScope, type Category } from "@/lib/catalog/categories";

function CategorySection({ label, active, className, children }: {
  label: string;
  active: boolean;
  className: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(active);
  const panelId = useId();
  return (
    <div>
      <button type="button" aria-expanded={open} aria-controls={panelId}
        onClick={() => setOpen(value => !value)} className={`${className} w-full cursor-pointer text-left`}>
        <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
        <span className="relative size-5 shrink-0" aria-hidden="true">
          <span className="absolute left-1 top-1/2 h-0.5 w-3 -translate-y-1/2 bg-current" />
          <span className={`absolute left-1/2 top-1 h-3 w-0.5 -translate-x-1/2 bg-current transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? "scale-y-0" : "scale-y-100"}`} />
        </span>
      </button>
      <div id={panelId} aria-hidden={!open} inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

export default function Navigation({ categories, mobile = false, onNavigate }: {
  categories: Category[];
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const roots = categories.filter(category => !category.parent);
  const links = [
    { label: "Головна", href: "/", active: pathname === "/" },
    ...roots.map(category => ({
      label: category.name,
      href: categoryHref(category.slug),
      active: categoryScope(categories, category).some(item => pathname === categoryHref(item.slug)),
    })),
    { label: "Про нас", href: "/about", active: pathname === "/about" },
  ];

  const renderBranches = (parentId: string, ancestors = new Set<string>()): React.ReactNode => {
    const seen = new Set([...ancestors, parentId]);
    const children = categories.filter(category => category.parent?.documentId === parentId && !seen.has(category.documentId));
    if (!children.length) return null;
    return (
      <ul className="ml-3 pl-3">
        {children.map((category, index) => (
          <li key={category.documentId} className="relative min-w-0 pb-1 last:pb-0">
            <span aria-hidden="true" className={`absolute -left-3 top-0 w-px bg-[#e53935]/60 ${index === children.length - 1 ? "h-[22px]" : "bottom-0"}`} />
            <span aria-hidden="true" className="absolute -left-3 top-[22px] h-px w-3 bg-[#e53935]/60" />
            <Link href={categoryHref(category.slug)} onClick={onNavigate}
              aria-current={pathname === categoryHref(category.slug) ? "page" : undefined}
              className="flex min-h-11 min-w-0 items-center border border-transparent px-2 py-2 text-sm [overflow-wrap:anywhere] text-[#1a1a1a] transition-colors duration-150 ease-out motion-reduce:transition-none hover:border-[#e53935]/30 hover:bg-[#fff5f5] hover:text-[#e53935] aria-[current=page]:border-[#e53935]/30 aria-[current=page]:bg-[#fff5f5] aria-[current=page]:text-[#e53935] focus-visible:outline-2 focus-visible:outline-[#e53935]">
              {category.name}
            </Link>
            {renderBranches(category.documentId, seen)}
          </li>
        ))}
      </ul>
    );
  };

  if (mobile) return (
    <nav aria-label="Каталог та меню" className="flex flex-col gap-2">
      {links.map(link => {
        const root = roots.find(category => categoryHref(category.slug) === link.href);
        const descendants = root ? categoryScope(categories, root).filter(item => item.documentId !== root.documentId) : [];
        const linkClass = `flex min-h-12 items-center justify-between gap-3 border px-4 py-3 text-sm font-semibold transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-[#e53935] ${link.active ? "border-[#e53935] bg-white text-[#e53935]" : "border-[#e0e0e0] bg-white text-[#1a1a1a] hover:border-[#e53935] hover:bg-[#fafafa] hover:text-[#e53935]"}`;
        return descendants.length ? (
          <CategorySection key={`${link.href}:${pathname}`} label={link.label} active={link.active} className={linkClass}>
            <div className="px-4 pb-2 pt-2">
              <Link href={link.href} onClick={onNavigate} aria-current={pathname === link.href ? "page" : undefined} className="mb-2 flex min-h-11 items-center justify-center border border-[#e53935]/50 bg-white px-3 text-sm font-semibold text-[#e53935] transition-colors duration-150 ease-out motion-reduce:transition-none hover:border-[#e53935] hover:bg-[#fff5f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e53935]">Усі товари</Link>
              {root && renderBranches(root.documentId)}
            </div>
          </CategorySection>
        ) : <Link key={link.href} href={link.href} onClick={onNavigate} aria-current={link.active ? "page" : undefined} className={linkClass}>{link.label}</Link>;
      })}
    </nav>
  );

  return (
    <nav aria-label="Категорії товарів" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {links.map((link) => {
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={link.active ? "page" : undefined}
            className={`font-['Outfit',sans-serif] text-[14px] whitespace-nowrap transition-colors duration-150 ease-out motion-reduce:transition-none ${
              link.active
                ? "font-bold !text-[#e53935]"
                    : "font-medium text-[#1a1a1a] hover:text-[#e53935]"
                }
            `}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
