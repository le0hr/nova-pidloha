import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-[80px] text-center">
      {/* Icon */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        className="mb-[24px]"
      >
        <path
          d="M17 10L11 17V51C11 53.2091 12.7909 55 15 55H49C51.2091 55 53 53.2091 53 51V17L47 10H17Z"
          stroke="#9E9E9E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 17H53"
          stroke="#9E9E9E"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M40 25C40 29.4183 36.4183 33 32 33C27.5817 33 24 29.4183 24 25"
          stroke="#9E9E9E"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <h2 className="font-['Outfit',sans-serif] text-[22px] font-bold text-[#1A1A1A]">
        Кошик порожній
      </h2>

      <p className="mt-[8px] font-['Inter',sans-serif] text-[14px] font-normal text-[#666666]">
        Додайте товари з каталогу
      </p>

      <Link
        href="/catalog"
        className="mt-[24px] bg-[#E53935] px-[28px] py-[12px] font-['Outfit',sans-serif] text-[14px] font-bold text-white transition-colors hover:bg-[#C62828]"
      >
        Перейти до каталогу
      </Link>
    </div>
  );
}