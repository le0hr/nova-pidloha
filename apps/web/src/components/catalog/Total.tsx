export default function Total({count}: {count: string}){
    return(
        <span className="catalog-total font-['Outfit',sans-serif] text-[14px] font-normal leading-normal text-[#9E9E9E]">
            {count} товарів в наявності
        </span>
    );

}
