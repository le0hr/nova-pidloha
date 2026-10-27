import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full shrink-0 border-b border-[#e0e0e0] bg-white">
      <div className="checkout-container flex min-h-[74px] items-center justify-between gap-3 py-3 md:min-h-[84px]">
        <Link href="/" aria-label="Нова Підлога та Двері — головна" className="flex shrink-0 items-center gap-2">
          <Image src="/nova-pidloha.png" width={42} height={42} alt="" className="size-8 -scale-y-100 rotate-180 object-cover md:size-[42px]" />
          <div>
            <p className="text-sm font-bold leading-tight text-[#1a1a1a] md:text-lg">НОВА ПІДЛОГА</p>
            <p className="text-[10px] font-semibold uppercase leading-tight text-[#e53935] md:text-[11px]">ТА ДВЕРІ</p>
          </div>
        </Link>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end gap-0.5 md:items-start">
            <span className="text-xs font-bold leading-tight text-[#1a1a1a]">0123456789</span>
            <span className="text-right text-[9px] leading-tight text-[#666]">За тарифами оператора</span>
          </div>
          <div className="hidden flex-col gap-0.5 text-sm leading-tight text-[#1a1a1a] md:flex">
            <span>м. Черкаси</span>
            <span>вул. Б. Вишнивецького</span>
            <span className="text-xs text-[#666]">Пн-Нд 9:00-19:00</span>
          </div>
        </div>
      </div>
    </header>
  );
}
