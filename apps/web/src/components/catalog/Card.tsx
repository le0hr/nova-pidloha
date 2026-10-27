import { CatalogProduct } from "@/types/catalog";
import Link from "next/link";
export default function Card({ product, index = 0 }: {product: CatalogProduct, index:number}) {
  const staggerDelay = `${0.06 + index * 0.07}s`;
    return(
        <Link 
        href={`/product/${product.slug}`} 
        className="catalog-card flex w-full min-w-0 flex-col items-start border border-[#E0E0E0] bg-white
                 transition-[border-color,translate] duration-150 ease-out hover:border-[#e53935] motion-safe:hover:-translate-y-1 motion-reduce:transition-none"
      style={{
        animation: `fade-up 0.42s cubic-bezier(0.22,1,0.36,1) ${staggerDelay} both`,
      }}>
            <img className="catalog-card-image block w-full min-w-0 h-[420px] items-start self-stretch object-cover" src = {product.images[0]} alt={product.name}/>
            <div className="catalog-card-details flex min-h-[54px] min-w-0 flex-col items-start gap-1.5 self-stretch p-[14px]">
                <h3 className="[overflow-wrap:anywhere] font-outfit text-[15px] font-bold text-[#1A1A1A]">{product.name}</h3>
                <span className="font-outfit text-xs font-light text-[#9E9E9E]"> тест матеріал</span>
            </div>
            {/* Purchase  */}
            <div className="catalog-card-purchase mt-auto flex min-h-[55px] min-w-0 items-center justify-between self-stretch px-[10px]">
                {/* Prices */}
                <div className="flex min-w-0 flex-wrap items-baseline gap-2 px-1">
                    <span className="[overflow-wrap:anywhere] font-outfit text-base font-bold text-[#1A1A1A]">
                        {product.price}
                    </span>
                    <span className="font-outfit text-xs font-normal text-[#9E9E9E] line-through">
                        4-0-0
                    </span>
                </div>
            </div>
        </Link>
        
    )
}
