"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Pagination({
        lastPage=8,
    }: {
        lastPage: number;
    }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPage = Number(searchParams.get("page")) || 1;
    const onPageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());

        if (page === 1) {
            params.delete("page");
        } else {
            params.set("page", String(page));
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    const getPages = () => {
        if (lastPage <= 5) {
        return Array.from({ length: lastPage }, (_, i) => i + 1);
        }

        if (currentPage <= 3) {
        return [1, 2, 3, "...", lastPage];
        }

        if (currentPage >= lastPage - 2) {
        return [1, "...", lastPage - 2, lastPage - 1, lastPage];
        }

        return [1, "...", currentPage-1, currentPage, currentPage+1, "...", lastPage];
    };

    const pages = getPages();
    if (lastPage <= 1) return null;
    return(

        <div className="flex items-center justify-between self-stretch border-t border-[#E0E0E0] py-4">
            {/* Previous */}
            <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="flex items-start border border-[#E0E0E0] px-4 py-2 text-[#1A1A1A] font-['Outfit'] text-[13px] font-normal leading-normal disabled:cursor-not-allowed disabled:opacity-40"
            >
                Назад
            </button>

            {/* Pages */}
            <div className="flex items-center gap-2">
                {pages.map((page, index) => {
                if (typeof page === "string") {
                    return (
                    <span
                        key={`dots-${index}`}
                        className="px-1 text-[#1A1A1A] font-['Outfit'] text-[13px]"
                    >
                        ...
                    </span>
                    );
                }

                const isActive = page === currentPage;

                return (
                    <button
                    key={page}
                    type="button"
                    onClick={() => onPageChange(page)}
                    className={`flex min-w-8 items-start justify-center px-3 py-2 font-['Outfit'] text-[13px] leading-normal ${
                        isActive
                        ? "bg-[#E53935] font-bold text-white"
                        : "text-[#1A1A1A] font-normal hover:bg-[#F5F5F5]"
                    }`}
                    >
                    {page}
                    </button>
                );
                })}
            </div>

            {/* Next */}
            <button
                type="button"
                disabled={currentPage === lastPage}
                onClick={() => onPageChange(currentPage + 1)}
                className="flex items-start border border-[#E0E0E0] px-4 py-2 text-[#1A1A1A] font-['Outfit'] text-[13px] font-normal leading-normal disabled:cursor-not-allowed disabled:opacity-40"
            >
                Вперед
            </button>
        </div>
    )
    
}