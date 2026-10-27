"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CartButton from "../../cart/CartButton";
import Navigation from "./Navigation";
import type { Category } from "@/lib/catalog/categories";

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return <Link href="/" onClick={onNavigate} aria-label="Нова Підлога та Двері — головна" className="flex shrink-0 items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e53935]">
    <Image src="/nova-pidloha.png" alt="" width={42} height={42} className="logo-img size-8 -scale-y-100 rotate-180 object-cover sm:size-10" />
    <span>
      <span className="logo-title block text-sm font-bold leading-tight text-[#1a1a1a] sm:text-base lg:text-lg">НОВА ПІДЛОГА</span>
      <span className="logo-subtitle block text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-[#e53935] lg:text-[11px]">ТА ДВЕРІ</span>
    </span>
  </Link>;
}

export default function Header({ categories }: { categories: Category[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeMenu = () => dialog.current?.close();

  useEffect(() => {
    if (!menuOpen || !dialog.current) return;
    const element = dialog.current;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => { if (desktop.matches) element.close(); };
    desktop.addEventListener("change", onResize);
    return () => {
      desktop.removeEventListener("change", onResize);
      document.body.style.overflow = previousOverflow;
      if (element.open) element.close();
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b border-[#e0e0e0] bg-white/95 shadow-[0_2px_12px_#00000005] backdrop-blur-md">
      <div className="content-container flex h-16 items-center justify-between gap-2 px-4 lg:hidden">
        <button type="button" aria-label="Відкрити меню" aria-expanded={menuOpen} aria-controls="mobile-category-navigation" onClick={() => setMenuOpen(true)}
          className={`flex size-11 shrink-0 items-center justify-center transition-colors duration-150 hover:text-[#e53935] focus-visible:outline-2 focus-visible:outline-[#e53935] ${menuOpen ? "text-[#e53935]" : "text-[#1a1a1a]"}`}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M3 6h16M3 11h12M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <Brand />
        <CartButton />
      </div>
      <div className="desktop-header hidden h-[84px] items-center lg:flex">
        <div className="content-container page-gutter flex w-full items-center justify-between gap-6 !py-0">
          <Brand />
          <Navigation categories={categories} />
          <CartButton />
        </div>
      </div>

      <dialog ref={dialog} id="mobile-category-navigation" aria-labelledby="mobile-menu-title" onClose={() => setMenuOpen(false)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu();
        }}
        className="mobile-shop-menu fixed inset-y-0 left-0 right-auto m-0 h-dvh max-h-none w-[min(88vw,380px)] max-w-none border-0 bg-white p-0 text-[#1a1a1a] shadow-2xl backdrop:bg-[#1a1a1a]/45 backdrop:backdrop-blur-sm">
        <div className="flex h-full flex-col">
          <div className="flex min-h-20 items-center justify-between gap-2 border-b border-[#e0e0e0] px-5">
            <Brand onNavigate={closeMenu} />
            <button autoFocus type="button" onClick={closeMenu} aria-label="Закрити меню" className="flex size-11 shrink-0 items-center justify-center border border-[#e0e0e0] transition-colors hover:border-[#e53935] hover:text-[#e53935] focus-visible:outline-2 focus-visible:outline-[#e53935]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e53935]"><span className="h-0.5 w-5 bg-[#e53935]" />Для вашого дому</p>
            <h2 id="mobile-menu-title" className="mb-6 text-2xl font-bold">Каталог та меню</h2>
            <Navigation categories={categories} mobile onNavigate={closeMenu} />
          </div>
          <div className="border-t border-[#e0e0e0] bg-[#f5f5f5] px-5 pt-5 pb-[max(20px,env(safe-area-inset-bottom))]">
            <p className="text-sm font-semibold">Обирайте наживо у Черкасах</p>
            <p className="mt-1 text-xs leading-relaxed text-[#666]">Підлога та двері у наших магазинах</p>
            <Link href="/#contacts" onClick={closeMenu} className="mt-4 flex min-h-11 items-center justify-center border border-[#e53935]/50 bg-white px-4 text-sm font-semibold text-[#e53935] transition-colors hover:border-[#e53935] hover:bg-[#fff5f5]">Наші магазини</Link>
          </div>
        </div>
      </dialog>
    </header>
  );
}
