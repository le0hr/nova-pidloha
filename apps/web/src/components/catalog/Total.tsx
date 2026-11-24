import { plural } from "@/lib/plural";

export default function Total({count}: {count: string}){
    return(
        <span className="catalog-total font-['Outfit',sans-serif] text-fs14 font-normal leading-normal text-[#9E9E9E]">
            {count} {plural(Number(count), "товар", "товари", "товарів")}
        </span>
    );

}
