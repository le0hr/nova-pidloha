import Link from "next/link";

/** 404 for unknown addresses (old links, deleted products). */
export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center font-['Outfit',sans-serif]">
      <p className="text-[56px] font-extrabold leading-none text-[#e53935]">404</p>
      <h1 className="text-[24px] font-bold text-[#1a1a1a] md:text-[32px]">Сторінку не знайдено</h1>
      <p className="max-w-[460px] text-fs15 text-[#555]">
        Можливо, товар уже не продається або адресу змінено. Перегляньте каталог або поверніться на головну.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/catalog" className="flex h-[48px] items-center bg-[#e53935] px-6 font-bold text-white hover:bg-[#c62828]">До каталогу</Link>
        <Link href="/" className="flex h-[48px] items-center border border-[#1a1a1a] px-6 font-semibold text-[#1a1a1a] hover:bg-[#f7f7f7]">На головну</Link>
      </div>
    </main>
  );
}
