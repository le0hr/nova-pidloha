type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="w-full bg-[#f7f7f7] md:bg-transparent animate-fade-in">
      <div className="content-container page-gutter mx-auto w-full max-w-[1760px] flex items-center gap-[8px] text-[12px] md:text-[13px]">
        {items.map((item, index) => (
          <span key={`${item.href ?? item.label}:${index}`} className="flex items-center gap-2">
            <a href={item.href} className="catalog-additional font-['Outfit',sans-serif] font-normal text-[#9e9e9e] hover:text-[#e53935] transition-colors">
              {item.label}
            </a>
            {index < items.length - 1 && <span className="text-[#9e9e9e]">&gt;</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
