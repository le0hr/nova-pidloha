import svgPaths from "./svg-e3fuhko1y7";
import img11 from "./87302d1f38e17f3e79cfa3ba4347f6dc47793a0a.png";
import imgCard1Img from "./9556ed58f93448a7b07c0221f36552870229ba6b.png";
import imgCard2Img from "./08f2af204ab8c5e61ccc1b3397940b138105d4d4.png";
import imgCard3Img from "./bde427341ff2fff32e73a673363bed87f45392f1.png";

function Menu() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="menu">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="22"
        preserveAspectRatio="none"
        viewBox="0 0 22 22"
        width="22"
      >
        <g id="menu">
          <path
            d={svgPaths.pf6df440}
            id="Vector"
            stroke="#E53935"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function MenuBtn() {
  return (
    <div
      className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[44px]"
      data-name="menu-btn"
    >
      <Menu />
    </div>
  );
}

function Slogan() {
  return (
    <div
      className="[word-break:break-word] h-[37px] leading-[normal] relative shrink-0 w-[137px]"
      data-name="slogan"
    >
      <p className="absolute font-semibold font-semibold left-0 right-0 text-[#1a1a1a] text-[18px] top-0">
        НОВА ПІДЛОГА
      </p>
      <p className="absolute font-medium font-medium left-0 right-0 text-[#e53935] text-[11px] top-[23px] uppercase">
        ТА ДВЕРІ
      </p>
    </div>
  );
}

function Logo() {
  return (
    <div
      className="content-stretch flex gap-[7px] items-center justify-center relative shrink-0"
      data-name="logo"
    >
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[38px]" data-name="1 1">
            <img
              alt=""
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
              src={img11}
            />
          </div>
        </div>
      </div>
      <Slogan />
    </div>
  );
}

function ShoppingBag() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="shopping-bag">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="24"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
        width="24"
      >
        <g id="shopping-bag">
          <path
            d={svgPaths.p23bcc680}
            id="Vector"
            stroke="#1A1A1A"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function CartCount() {
  return (
    <div
      className="absolute bg-[#e53935] content-stretch flex items-start px-[6px] py-[2px] right-[-2px] rounded-[10px] top-[-2px]"
      data-name="CartCount"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] not-italic relative shrink-0 text-[10px] text-white whitespace-nowrap">
        3
      </p>
    </div>
  );
}

function CartIcon() {
  return (
    <div
      className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[40px]"
      data-name="CartIcon"
    >
      <ShoppingBag />
      <CartCount />
    </div>
  );
}

function MobileHeader() {
  return (
    <div
      className="bg-white h-[74px] relative shrink-0 w-full"
      data-name="mobile-header"
    >
      <div
        aria-hidden
        className="absolute border-[#e0e0e0] border-b border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16px] py-[12px] relative size-full">
          <MenuBtn />
          <Logo />
          <CartIcon />
        </div>
      </div>
    </div>
  );
}

function Breadcrumb() {
  return (
    <div
      className="bg-[#f7f7f7] relative shrink-0 w-full"
      data-name="breadcrumb"
    >
      <div className="[word-break:break-word] content-stretch flex items-start leading-[normal] px-[16px] py-[12px] relative size-full text-[12px] whitespace-nowrap">
        <p className="font-light font-light relative shrink-0 text-[#9e9e9e]">
          Головна
        </p>
        <p className="font-light font-light relative shrink-0 text-[#9e9e9e]">{` > `}</p>
        <p className="font-medium font-medium relative shrink-0 text-[#1a1a1a]">
          Двері
        </p>
      </div>
    </div>
  );
}

function PageTitleRow() {
  return (
    <div
      className="bg-white relative shrink-0 w-full"
      data-name="page-title-row"
    >
      <div className="flex flex-row items-center size-full">
        <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] pb-[8px] pt-[16px] px-[16px] relative size-full whitespace-nowrap">
          <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[22px]">
            Каталог дверей
          </p>
          <p className="font-normal font-normal relative shrink-0 text-[#9e9e9e] text-[13px]">
            48 товарів
          </p>
        </div>
      </div>
    </div>
  );
}

function Sliders() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="sliders">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="16"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
        width="16"
      >
        <g id="sliders">
          <path
            d={svgPaths.p3673b280}
            id="Vector"
            stroke="#1A1A1A"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function FilterBtn() {
  return (
    <div
      className="bg-[#f7f7f7] content-stretch flex gap-[6px] items-center px-[12px] py-[8px] relative shrink-0"
      data-name="filter-btn"
    >
      <Sliders />
      <p className="[word-break:break-word] font-medium font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        Фільтри
      </p>
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="chevron-down">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="14"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
        width="14"
      >
        <g id="chevron-down">
          <path
            d="M3.5 5.25L7 8.75L10.5 5.25"
            id="Vector"
            stroke="#1A1A1A"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SortBtn() {
  return (
    <div
      className="bg-[#f7f7f7] content-stretch flex gap-[6px] items-center px-[12px] py-[8px] relative shrink-0"
      data-name="sort-btn"
    >
      <p className="[word-break:break-word] font-medium font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        Сортувати
      </p>
      <ChevronDown />
    </div>
  );
}

function FilterSortBar() {
  return (
    <div
      className="bg-white relative shrink-0 w-full"
      data-name="filter-sort-bar"
    >
      <div
        aria-hidden
        className="absolute border-[#e0e0e0] border-b border-solid border-t inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16px] py-[10px] relative size-full">
          <FilterBtn />
          <SortBtn />
        </div>
      </div>
    </div>
  );
}

function Chip() {
  return (
    <div
      className="bg-white content-stretch flex items-center px-[10px] py-[6px] relative shrink-0"
      data-name="chip-1"
    >
      <div
        aria-hidden
        className="absolute border border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-medium font-medium leading-[normal] relative shrink-0 text-[#e53935] text-[12px] whitespace-nowrap">
        Міжкімнатні ×
      </p>
    </div>
  );
}

function Chip1() {
  return (
    <div
      className="bg-white content-stretch flex items-center px-[10px] py-[6px] relative shrink-0"
      data-name="chip-2"
    >
      <div
        aria-hidden
        className="absolute border border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-medium font-medium leading-[normal] relative shrink-0 text-[#e53935] text-[12px] whitespace-nowrap">
        Білий ×
      </p>
    </div>
  );
}

function FilterChips() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="filter-chips">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[10px] relative size-full">
          <Chip />
          <Chip1 />
        </div>
      </div>
    </div>
  );
}

function Heart() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="heart">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="16"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
        width="16"
      >
        <g id="heart">
          <path
            d={svgPaths.p3692f680}
            id="Vector"
            stroke="#9E9E9E"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function HeartBtn() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col items-center justify-center right-[8px] size-[30px] top-[8px]"
      data-name="heart-btn-1"
    >
      <Heart />
    </div>
  );
}

function SaleBadge() {
  return (
    <div
      className="absolute bg-[#e53935] content-stretch flex items-start left-0 px-[8px] py-[4px] top-0"
      data-name="sale-badge-1"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[10px] text-white whitespace-nowrap">
        -18%
      </p>
    </div>
  );
}

function Card1Img() {
  return (
    <div
      className="content-stretch flex h-[316px] items-start relative shrink-0 w-full"
      data-name="card-1-img"
    >
      <img
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgCard1Img}
      />
      <HeartBtn />
      <SaleBadge />
    </div>
  );
}

function Prices() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start leading-[normal] relative shrink-0 w-full whitespace-nowrap"
      data-name="prices-1"
    >
      <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-from-font decoration-solid font-normal font-normal line-through relative shrink-0 text-[#bdbdbd] text-[11px]">
        ₴ 5,900
      </p>
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[15px]">
        ₴ 4,850
      </p>
    </div>
  );
}

function Btn() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex flex-col items-center justify-center py-[8px] relative shrink-0 w-full"
      data-name="btn-1"
    >
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[12px] text-white whitespace-nowrap">
        В кошик
      </p>
    </div>
  );
}

function Card1Info() {
  return (
    <div className="relative shrink-0 w-full" data-name="card-1-info">
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[10px] relative size-full">
        <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] w-full">
          Porta CPL 1.1
        </p>
        <p className="[word-break:break-word] font-light font-light leading-[normal] relative shrink-0 text-[#9e9e9e] text-[11px] w-full">
          МДФ | Екошпон
        </p>
        <Prices />
        <Btn />
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="bg-white flex-[1_0_0] min-w-px relative" data-name="card-1">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Card1Img />
        <Card1Info />
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function Heart1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="heart">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="16"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
        width="16"
      >
        <g id="heart">
          <path
            d={svgPaths.p3692f680}
            id="Vector"
            stroke="#9E9E9E"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function HeartBtn1() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col items-center justify-center right-[8px] size-[30px] top-[8px]"
      data-name="heart-btn-2"
    >
      <Heart1 />
    </div>
  );
}

function Card2Img() {
  return (
    <div
      className="content-stretch flex h-[316px] items-start relative shrink-0 w-full"
      data-name="card-2-img"
    >
      <img
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgCard2Img}
      />
      <HeartBtn1 />
    </div>
  );
}

function Prices1() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="prices-2"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap">
        ₴ 7,200
      </p>
    </div>
  );
}

function Btn1() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex flex-col items-center justify-center py-[8px] relative shrink-0 w-full"
      data-name="btn-2"
    >
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[12px] text-white whitespace-nowrap">
        В кошик
      </p>
    </div>
  );
}

function Card2Info() {
  return (
    <div className="h-[130px] relative shrink-0 w-full" data-name="card-2-info">
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[10px] relative size-full">
        <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] w-full">
          Darumi Plato
        </p>
        <p className="[word-break:break-word] font-light font-light leading-[normal] relative shrink-0 text-[#9e9e9e] text-[11px] w-full">
          Масив | Шпон
        </p>
        <Prices1 />
        <Btn1 />
      </div>
    </div>
  );
}

function Card1() {
  return (
    <div
      className="bg-white flex-[1_0_0] h-[444px] min-w-px relative"
      data-name="card-2"
    >
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Card2Img />
        <Card2Info />
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function GridRow() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full"
      data-name="grid-row-1"
    >
      <Card />
      <Card1 />
    </div>
  );
}

function Heart2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="heart">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="16"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
        width="16"
      >
        <g id="heart">
          <path
            d={svgPaths.p3692f680}
            id="Vector"
            stroke="#9E9E9E"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function HeartBtn2() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col items-center justify-center right-[8px] size-[30px] top-[8px]"
      data-name="heart-btn-3"
    >
      <Heart2 />
    </div>
  );
}

function Card3Img() {
  return (
    <div
      className="content-stretch flex h-[450px] items-start relative shrink-0 w-full"
      data-name="card-3-img"
    >
      <img
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgCard3Img}
      />
      <HeartBtn2 />
    </div>
  );
}

function Prices2() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="prices-3"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap">
        ₴ 3,950
      </p>
    </div>
  );
}

function Btn2() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex flex-col items-center justify-center py-[8px] relative shrink-0 w-full"
      data-name="btn-3"
    >
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[12px] text-white whitespace-nowrap">
        В кошик
      </p>
    </div>
  );
}

function Card3Info() {
  return (
    <div className="relative shrink-0 w-full" data-name="card-3-info">
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[10px] relative size-full">
        <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] w-full">
          Terminus Sweet
        </p>
        <p className="[word-break:break-word] font-light font-light leading-[normal] relative shrink-0 text-[#9e9e9e] text-[11px] w-full">
          МДФ | Скло
        </p>
        <Prices2 />
        <Btn2 />
      </div>
    </div>
  );
}

function Card2() {
  return (
    <div className="bg-white flex-[1_0_0] min-w-px relative" data-name="card-3">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Card3Img />
        <Card3Info />
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function Heart3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="heart">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="16"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
        width="16"
      >
        <g id="heart">
          <path
            d={svgPaths.p3692f680}
            id="Vector"
            stroke="#9E9E9E"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function HeartBtn3() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col items-center justify-center right-[8px] size-[30px] top-[8px]"
      data-name="heart-btn-4"
    >
      <Heart3 />
    </div>
  );
}

function SaleBadge1() {
  return (
    <div
      className="absolute bg-[#e53935] content-stretch flex items-start left-0 px-[8px] py-[4px] top-0"
      data-name="sale-badge-4"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[10px] text-white whitespace-nowrap">
        -19%
      </p>
    </div>
  );
}

function Card4Img() {
  return (
    <div
      className="bg-white content-stretch flex h-[450px] items-start relative shrink-0 w-full"
      data-name="card-4-img"
    >
      <HeartBtn3 />
      <SaleBadge1 />
    </div>
  );
}

function Prices3() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start leading-[normal] relative shrink-0 w-full whitespace-nowrap"
      data-name="prices-4"
    >
      <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-from-font decoration-solid font-normal font-normal line-through relative shrink-0 text-[#bdbdbd] text-[11px]">
        ₴ 6,300
      </p>
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[15px]">
        ₴ 5,100
      </p>
    </div>
  );
}

function Btn3() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex flex-col items-center justify-center py-[8px] relative shrink-0 w-full"
      data-name="btn-4"
    >
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[12px] text-white whitespace-nowrap">
        В кошик
      </p>
    </div>
  );
}

function Card4Info() {
  return (
    <div className="relative shrink-0 w-full" data-name="card-4-info">
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[10px] relative size-full">
        <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] w-full">
          Leador Lorenza
        </p>
        <p className="[word-break:break-word] font-light font-light leading-[normal] relative shrink-0 text-[#9e9e9e] text-[11px] w-full">
          Екошпон
        </p>
        <Prices3 />
        <Btn3 />
      </div>
    </div>
  );
}

function Card3() {
  return (
    <div className="bg-white flex-[1_0_0] min-w-px relative" data-name="card-4">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Card4Img />
        <Card4Info />
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function GridRow1() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full"
      data-name="grid-row-2"
    >
      <Card2 />
      <Card3 />
    </div>
  );
}

function ProductGrid() {
  return (
    <div
      className="bg-[#f7f7f7] relative shrink-0 w-full"
      data-name="product-grid"
    >
      <div className="content-stretch flex flex-col gap-[12px] items-start pb-[16px] pt-[8px] px-[16px] relative size-full">
        <GridRow />
        <GridRow1 />
      </div>
    </div>
  );
}

function LoadMoreBtn() {
  return (
    <div
      className="bg-white content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-w-px py-[13px] relative"
      data-name="load-more-btn"
    >
      <div
        aria-hidden
        className="absolute border border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#e53935] text-[14px] whitespace-nowrap">
        Завантажити ще
      </p>
    </div>
  );
}

function LoadMore() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="load-more">
      <div className="content-stretch flex items-start p-[16px] relative size-full">
        <LoadMoreBtn />
      </div>
    </div>
  );
}

function CatalogContent() {
  return (
    <div
      className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px relative w-full"
      data-name="catalog-content"
    >
      <Breadcrumb />
      <PageTitleRow />
      <FilterSortBar />
      <FilterChips />
      <ProductGrid />
      <LoadMore />
    </div>
  );
}

function FooterLogo() {
  return (
    <div
      className="content-stretch flex gap-[10px] items-center relative shrink-0"
      data-name="footer-logo"
    >
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[38px]" data-name="1 1">
            <img
              alt=""
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
              src={img11}
            />
          </div>
        </div>
      </div>
      <div className="[word-break:break-word] font-semibold font-semibold leading-[0] relative shrink-0 text-[18px] text-white whitespace-nowrap">
        <p className="leading-[normal] mb-0">НОВА ПІДЛОГА</p>
        <p className="font-normal font-normal leading-[normal] text-[#e53935]">
          ТА ДВЕРІ
        </p>
      </div>
    </div>
  );
}

function Phone1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="phone">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="16"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
        width="16"
      >
        <g clipPath="url(#clip0_0_10)" id="phone">
          <path
            d={svgPaths.p29098400}
            id="Vector"
            stroke="#E53935"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_10">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Phone() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full"
      data-name="phone"
    >
      <Phone1 />
      <p className="[word-break:break-word] flex-[1_0_0] font-medium font-medium leading-[normal] min-w-px relative text-[13px] text-white">
        +38 (097) 123-45-67
      </p>
    </div>
  );
}

function MapPin() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="map-pin">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="16"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
        width="16"
      >
        <g id="map-pin">
          <path
            d={svgPaths.p8b99100}
            id="Vector"
            stroke="#E53935"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function Address() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full"
      data-name="address"
    >
      <MapPin />
      <p className="[word-break:break-word] flex-[1_0_0] font-light font-light leading-[normal] min-w-px opacity-75 relative text-[13px] text-white">
        Черкаси, Україна
      </p>
    </div>
  );
}

function FooterContact() {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full"
      data-name="footer-contact"
    >
      <Phone />
      <Address />
    </div>
  );
}

function Facebook() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="facebook">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="18"
        preserveAspectRatio="none"
        viewBox="0 0 18 18"
        width="18"
      >
        <g id="facebook">
          <path
            d={svgPaths.p304d6600}
            id="Vector"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function Instagram() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="instagram">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="18"
        preserveAspectRatio="none"
        viewBox="0 0 18 18"
        width="18"
      >
        <g clipPath="url(#clip0_0_8)" id="instagram">
          <path
            d={svgPaths.p1a239e00}
            id="Vector"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_8">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function MessageCircle() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="message-circle">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="18"
        preserveAspectRatio="none"
        viewBox="0 0 18 18"
        width="18"
      >
        <g clipPath="url(#clip0_0_14)" id="message-circle">
          <path
            d={svgPaths.p16ccbb80}
            id="Vector"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_14">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function FooterSocials() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center relative shrink-0"
      data-name="footer-socials"
    >
      <Facebook />
      <Instagram />
      <MessageCircle />
    </div>
  );
}

function FooterBrand() {
  return (
    <div
      className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full"
      data-name="footer-brand"
    >
      <FooterLogo />
      <p className="[word-break:break-word] font-light font-light leading-[1.5] min-w-full opacity-75 relative shrink-0 text-[13px] text-white w-[min-content]">
        Широкий асортимент сертифікованого підлогового покриття та міжкімнатних
        дверей в наявності та під замовлення у Черкасах.
      </p>
      <FooterContact />
      <FooterSocials />
    </div>
  );
}

function FooterDivider() {
  return (
    <div
      className="bg-white h-px opacity-12 relative shrink-0 w-full"
      data-name="footer-divider"
    />
  );
}

function Footer() {
  return (
    <div
      className="bg-[#1a1a1a] h-[274px] relative shrink-0 w-full"
      data-name="footer"
    >
      <div className="content-stretch flex flex-col gap-[16px] items-start px-[16px] py-[24px] relative size-full">
        <FooterBrand />
        <FooterDivider />
        <p className="[word-break:break-word] font-light font-light leading-[normal] opacity-60 relative shrink-0 text-[12px] text-white w-full">
          © 2025 Нова підлога та Двері. Всі права захищені.
        </p>
      </div>
    </div>
  );
}

export default function MobileHome() {
  return (
    <div
      className="bg-white content-stretch flex flex-col gap-[24px] items-start relative size-full"
      data-name="Нова підлога та Двері - Mobile Home"
    >
      <MobileHeader />
      <CatalogContent />
      <Footer />
    </div>
  );
}
