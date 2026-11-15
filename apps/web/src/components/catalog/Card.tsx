import { CatalogProduct } from "@/types/catalog";
import Link from "next/link";
import CardImages from "./CardImages";
import { displayDiscount, displayOldPrice } from "@/lib/catalog/floor";
export default function Card({ product, index = 0 }: {product: CatalogProduct, index:number}) {
  const staggerDelay = `${0.06 + index * 0.07}s`;
  const oldPrice = displayOldPrice(product.price, product.slug);
    return(
        <Link 
        href={`/product/${product.slug}`} 
        className="catalog-card relative flex w-full min-w-0 flex-col items-start border border-[#E0E0E0] bg-white
                 transition-[border-color,translate] duration-150 ease-out hover:border-[#e53935] motion-safe:hover:-translate-y-1 motion-reduce:transition-none"
      style={{
        animation: `fade-up 0.42s cubic-bezier(0.22,1,0.36,1) ${staggerDelay} both`,
      }}>
            {(product.isNew || oldPrice) && (
              <span className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
                {product.isNew && (
                  <span className="bg-[#1A1A1A] px-2 py-1 font-outfit text-xs font-bold uppercase tracking-wide text-white">New</span>
                )}
                {oldPrice && (
                  <span className="bg-[#e53935] px-2 py-1 font-outfit text-xs font-bold text-white">-{displayDiscount(product.slug)}%</span>
                )}
              </span>
            )}
            <CardImages images={product.images} alt={product.name}
              className={`catalog-card-image ${product.square ? "catalog-card-square " : ""}block w-full min-w-0 h-[420px] self-stretch overflow-hidden`} />
            <div className="catalog-card-details flex min-h-[54px] min-w-0 flex-col items-start gap-1.5 self-stretch p-[14px]">
                <h3 className="[overflow-wrap:anywhere] font-outfit text-[15px] font-bold text-[#1A1A1A]">{product.name}</h3>
                {product.description && <span className="line-clamp-2 font-outfit text-xs font-light text-[#9E9E9E]">{product.description}</span>}
            </div>
            {/* Purchase  */}
            <div className="catalog-card-purchase mt-auto flex min-h-[55px] min-w-0 items-center justify-between self-stretch px-[10px]">
                {/* Prices */}
                <div className="flex min-w-0 flex-wrap items-baseline gap-2 px-1">
                    <span className="[overflow-wrap:anywhere] font-outfit text-base font-bold text-[#1A1A1A]">
                        {product.price}
                        {product.unit && <span className="text-xs font-normal text-[#9E9E9E]"> /{product.unit}</span>}
                    </span>
                    {oldPrice && <span className="font-outfit text-xs font-normal text-[#9E9E9E] line-through">
                        {oldPrice}
                    </span>}
                </div>
            </div>
        </Link>
        
    )
}
