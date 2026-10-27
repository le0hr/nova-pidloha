import svgPaths from "./svg-o5jycti3rp";
import imgBrandIcon from "./87302d1f38e17f3e79cfa3ba4347f6dc47793a0a.png";
import imgCardImageBox from "./9556ed58f93448a7b07c0221f36552870229ba6b.png";
import imgCardImageBox1 from "./08f2af204ab8c5e61ccc1b3397940b138105d4d4.png";
import imgCardImageBox2 from "./bde427341ff2fff32e73a673363bed87f45392f1.png";

function Icon() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="12"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
        width="12"
      >
        <g clipPath="url(#clip0_0_21)" id="Icon">
          <path
            d={svgPaths.p1acf0ed1}
            id="Vector"
            stroke="#E53935"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_21">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Address() {
  return (
    <div
      className="content-stretch flex gap-[6px] items-center relative shrink-0"
      data-name="address"
    >
      <Icon />
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] opacity-80 relative shrink-0 text-[12px] text-white whitespace-nowrap">
        м. Черкаси, Україна
      </p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="12"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
        width="12"
      >
        <g clipPath="url(#clip0_0_12)" id="Icon">
          <path
            d={svgPaths.p29099600}
            id="Vector"
            stroke="#E53935"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_12">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Phone() {
  return (
    <div
      className="content-stretch flex gap-[6px] items-center relative shrink-0"
      data-name="phone"
    >
      <Icon1 />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[12px] text-white whitespace-nowrap">
        +38 (097) 123-45-67
      </p>
    </div>
  );
}

function TopLeft() {
  return (
    <div
      className="content-stretch flex gap-[16px] items-center relative shrink-0"
      data-name="top-left"
    >
      <Address />
      <Phone />
    </div>
  );
}

function TopBar() {
  return (
    <div className="bg-[#1a1a1a] relative shrink-0 w-full" data-name="top-bar">
      <div className="content-stretch flex items-start justify-between px-[80px] py-[8px] relative size-full">
        <TopLeft />
        <p className="[word-break:break-word] font-normal font-normal leading-[normal] opacity-60 relative shrink-0 text-[12px] text-white whitespace-nowrap">
          Доставка та професійне встановлення по Черкаській області
        </p>
      </div>
    </div>
  );
}

function Slogan() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start leading-[normal] relative shrink-0 whitespace-nowrap"
      data-name="slogan"
    >
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[18px]">
        НОВА ПІДЛОГА
      </p>
      <p className="font-semibold font-semibold relative shrink-0 text-[#e53935] text-[11px] uppercase">
        ТА ДВЕРІ
      </p>
    </div>
  );
}

function Logo() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0"
      data-name="logo"
    >
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[42px]" data-name="brand-icon">
            <img
              alt=""
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
              src={imgBrandIcon}
            />
          </div>
        </div>
      </div>
      <Slogan />
    </div>
  );
}

function NavLinks() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex gap-[28px] items-center leading-[normal] relative shrink-0 text-[14px] whitespace-nowrap"
      data-name="nav-links"
    >
      <p className="font-medium font-medium relative shrink-0 text-[#1a1a1a]">
        Головна
      </p>
      <p className="font-bold font-bold relative shrink-0 text-[#e53935]">
        Міжкімнатні двері
      </p>
      <p className="font-medium font-medium relative shrink-0 text-[#1a1a1a]">
        Вхідні двері
      </p>
      <p className="font-medium font-medium relative shrink-0 text-[#1a1a1a]">
        Фурнітура
      </p>
      <p className="font-medium font-medium relative shrink-0 text-[#1a1a1a]">
        Акції
      </p>
      <p className="font-medium font-medium relative shrink-0 text-[#1a1a1a]">
        Про нас
      </p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="20"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
        width="20"
      >
        <g clipPath="url(#clip0_0_19)" id="Icon">
          <path
            d={svgPaths.p2fc61480}
            id="Vector"
            stroke="#1A1A1A"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_19">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ShoppingBag() {
  return (
    <div
      className="overflow-clip relative shrink-0 size-[24px]"
      data-name="shopping-bag"
    >
      <Icon2 />
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

function HeaderTools() {
  return (
    <div
      className="content-stretch flex items-center relative shrink-0"
      data-name="header-tools"
    >
      <CartIcon />
    </div>
  );
}

function DesktopHeader() {
  return (
    <div
      className="bg-white h-[84px] relative shrink-0 w-full"
      data-name="desktop-header"
    >
      <div
        aria-hidden
        className="absolute border-[#e0e0e0] border-b border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[80px] py-[18px] relative size-full">
          <Logo />
          <NavLinks />
          <HeaderTools />
        </div>
      </div>
    </div>
  );
}

function HeaderWrapper() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="header-wrapper"
    >
      <TopBar />
      <DesktopHeader />
    </div>
  );
}

function Breadcrumb() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] relative shrink-0 text-[13px] w-full whitespace-nowrap"
      data-name="breadcrumb"
    >
      <p className="font-normal font-normal relative shrink-0 text-[#9e9e9e]">
        Головна
      </p>
      <p className="font-normal font-normal relative shrink-0 text-[#9e9e9e]">{` > `}</p>
      <p className="font-medium font-medium relative shrink-0 text-[#1a1a1a]">
        Каталог дверей
      </p>
    </div>
  );
}

function TitleAndTotal() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex gap-[16px] items-baseline leading-[normal] relative shrink-0 whitespace-nowrap"
      data-name="title-and-total"
    >
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[32px]">
        Каталог дверей
      </p>
      <p className="font-normal font-normal relative shrink-0 text-[#9e9e9e] text-[14px]">
        48 товарів в наявності
      </p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="12"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
        width="12"
      >
        <g clipPath="url(#clip0_0_17)" id="Icon">
          <path
            d="M0 0L6 12L12 0"
            id="Vector"
            stroke="#1A1A1A"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_17">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function SortDropdown() {
  return (
    <div
      className="content-stretch flex gap-[6px] items-center px-[12px] py-[6px] relative shrink-0"
      data-name="sort-dropdown"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-medium font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        За популярністю
      </p>
      <Icon3 />
    </div>
  );
}

function SortingOptions() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0"
      data-name="sorting-options"
    >
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#9e9e9e] text-[14px] whitespace-nowrap">
        Сортування:
      </p>
      <SortDropdown />
    </div>
  );
}

function TitleBar() {
  return (
    <div
      className="content-stretch flex items-baseline justify-between relative shrink-0 w-full"
      data-name="title-bar"
    >
      <TitleAndTotal />
      <SortingOptions />
    </div>
  );
}

function TitleRow() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] relative shrink-0 w-full whitespace-nowrap"
      data-name="title-row"
    >
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[16px]">
        Параметри
      </p>
      <p className="[text-underline-position:from-font] decoration-from-font decoration-solid font-medium font-medium relative shrink-0 text-[#e53935] text-[12px] underline">
        Скинути
      </p>
    </div>
  );
}

function Option() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0"
      data-name="option"
    >
      <div
        className="bg-white relative shrink-0 size-[14px]"
        data-name="Rectangle"
      >
        <div
          aria-hidden
          className="absolute border-2 border-[#e53935] border-solid inset-0 pointer-events-none"
        />
      </div>
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#e53935] text-[13px] whitespace-nowrap">
        Міжкімнатні
      </p>
    </div>
  );
}

function Option1() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0"
      data-name="option"
    >
      <div
        className="bg-white relative shrink-0 size-[14px]"
        data-name="Rectangle"
      >
        <div
          aria-hidden
          className="absolute border border-[#9e9e9e] border-solid inset-0 pointer-events-none"
        />
      </div>
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        Вхідні
      </p>
    </div>
  );
}

function Option2() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0"
      data-name="option"
    >
      <div
        className="bg-white relative shrink-0 size-[14px]"
        data-name="Rectangle"
      >
        <div
          aria-hidden
          className="absolute border border-[#9e9e9e] border-solid inset-0 pointer-events-none"
        />
      </div>
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        Розсувні
      </p>
    </div>
  );
}

function GroupContent() {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full"
      data-name="group-content"
    >
      <Option />
      <Option1 />
      <Option2 />
    </div>
  );
}

function FilterGroup() {
  return (
    <div
      className="content-stretch flex flex-col gap-[12px] items-start pb-[20px] relative shrink-0 w-full"
      data-name="Filter-Group"
    >
      <div
        aria-hidden
        className="absolute border-[#e0e0e0] border-b border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] uppercase whitespace-nowrap">
        Тип
      </p>
      <GroupContent />
    </div>
  );
}

function Option3() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0"
      data-name="option"
    >
      <div
        className="bg-white relative shrink-0 size-[14px]"
        data-name="Rectangle"
      >
        <div
          aria-hidden
          className="absolute border border-[#9e9e9e] border-solid inset-0 pointer-events-none"
        />
      </div>
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        МДФ
      </p>
    </div>
  );
}

function Option4() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0"
      data-name="option"
    >
      <div
        className="bg-white relative shrink-0 size-[14px]"
        data-name="Rectangle"
      >
        <div
          aria-hidden
          className="absolute border border-[#9e9e9e] border-solid inset-0 pointer-events-none"
        />
      </div>
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        Масив
      </p>
    </div>
  );
}

function Option5() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0"
      data-name="option"
    >
      <div
        className="bg-white relative shrink-0 size-[14px]"
        data-name="Rectangle"
      >
        <div
          aria-hidden
          className="absolute border border-[#9e9e9e] border-solid inset-0 pointer-events-none"
        />
      </div>
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        Шпон
      </p>
    </div>
  );
}

function Option6() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0"
      data-name="option"
    >
      <div
        className="bg-white relative shrink-0 size-[14px]"
        data-name="Rectangle"
      >
        <div
          aria-hidden
          className="absolute border border-[#9e9e9e] border-solid inset-0 pointer-events-none"
        />
      </div>
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        Екошпон
      </p>
    </div>
  );
}

function GroupContent1() {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full"
      data-name="group-content"
    >
      <Option3 />
      <Option4 />
      <Option5 />
      <Option6 />
    </div>
  );
}

function FilterGroup1() {
  return (
    <div
      className="content-stretch flex flex-col gap-[12px] items-start pb-[20px] relative shrink-0 w-full"
      data-name="Filter-Group"
    >
      <div
        aria-hidden
        className="absolute border-[#e0e0e0] border-b border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] uppercase whitespace-nowrap">
        Матеріал
      </p>
      <GroupContent1 />
    </div>
  );
}

function SwatchItem() {
  return (
    <div
      className="content-stretch flex gap-[4px] items-center p-[4px] relative shrink-0"
      data-name="swatch-item"
    >
      <div
        aria-hidden
        className="absolute border border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <div
        className="bg-white relative shrink-0 size-[18px]"
        data-name="Rectangle"
      >
        <div
          aria-hidden
          className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
        />
      </div>
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[11px] whitespace-nowrap">
        Білий
      </p>
    </div>
  );
}

function SwatchItem1() {
  return (
    <div
      className="content-stretch flex gap-[4px] items-center p-[4px] relative shrink-0"
      data-name="swatch-item"
    >
      <div
        aria-hidden
        className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none"
      />
      <div
        className="bg-[#3b2f2f] relative shrink-0 size-[18px]"
        data-name="Rectangle"
      />
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[11px] whitespace-nowrap">
        Венге
      </p>
    </div>
  );
}

function SwatchItem2() {
  return (
    <div
      className="content-stretch flex gap-[4px] items-center p-[4px] relative shrink-0"
      data-name="swatch-item"
    >
      <div
        aria-hidden
        className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none"
      />
      <div
        className="bg-[#c59b73] relative shrink-0 size-[18px]"
        data-name="Rectangle"
      />
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[11px] whitespace-nowrap">
        Дуб
      </p>
    </div>
  );
}

function SwatchItem3() {
  return (
    <div
      className="content-stretch flex gap-[4px] items-center p-[4px] relative shrink-0"
      data-name="swatch-item"
    >
      <div
        aria-hidden
        className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none"
      />
      <div
        className="bg-[#7b5e43] relative shrink-0 size-[18px]"
        data-name="Rectangle"
      />
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[11px] whitespace-nowrap">
        Горіх
      </p>
    </div>
  );
}

function SwatchesContainer() {
  return (
    <div
      className="content-start flex flex-wrap gap-[8px] items-start relative shrink-0 w-full"
      data-name="swatches-container"
    >
      <SwatchItem />
      <SwatchItem1 />
      <SwatchItem2 />
      <SwatchItem3 />
    </div>
  );
}

function GroupContent2() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="group-content"
    >
      <SwatchesContainer />
    </div>
  );
}

function FilterGroup2() {
  return (
    <div
      className="content-stretch flex flex-col gap-[12px] items-start pb-[20px] relative shrink-0 w-full"
      data-name="Filter-Group"
    >
      <div
        aria-hidden
        className="absolute border-[#e0e0e0] border-b border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] uppercase whitespace-nowrap">
        Колір
      </p>
      <GroupContent2 />
    </div>
  );
}

function Min() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="min">
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <div className="content-stretch flex items-start px-[8px] py-[4px] relative size-full">
        <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[12px] whitespace-nowrap">
          ₴ 1,200
        </p>
      </div>
    </div>
  );
}

function Max() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="max">
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <div className="content-stretch flex items-start px-[8px] py-[4px] relative size-full">
        <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[12px] whitespace-nowrap">
          ₴ 18,000
        </p>
      </div>
    </div>
  );
}

function PriceInputs() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full"
      data-name="price-inputs"
    >
      <Min />
      <Max />
    </div>
  );
}

function LineBg() {
  return (
    <div
      className="bg-[#e0e0e0] content-stretch flex h-[4px] items-start relative shrink-0 w-full"
      data-name="line-bg"
    >
      <div
        className="absolute bg-[#e53935] h-[4px] left-[30px] top-0 w-[140px]"
        data-name="active-segment"
      />
      <div
        className="absolute left-[30px] size-[12px] top-[-4px]"
        data-name="handle-1"
      >
        <svg
          className="absolute block inset-0 size-full"
          fill="none"
          height="12"
          preserveAspectRatio="none"
          viewBox="0 0 12 12"
          width="12"
        >
          <circle cx="6" cy="6" fill="#E53935" id="handle-1" r="6" />
        </svg>
      </div>
      <div
        className="absolute left-[170px] size-[12px] top-[-4px]"
        data-name="handle-2"
      >
        <svg
          className="absolute block inset-0 size-full"
          fill="none"
          height="12"
          preserveAspectRatio="none"
          viewBox="0 0 12 12"
          width="12"
        >
          <circle cx="6" cy="6" fill="#E53935" id="handle-1" r="6" />
        </svg>
      </div>
    </div>
  );
}

function RangeTrack() {
  return (
    <div
      className="content-stretch flex flex-col items-start py-[8px] relative shrink-0 w-full"
      data-name="range-track"
    >
      <LineBg />
    </div>
  );
}

function GroupContent3() {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full"
      data-name="group-content"
    >
      <PriceInputs />
      <RangeTrack />
    </div>
  );
}

function FilterGroup3() {
  return (
    <div
      className="content-stretch flex flex-col gap-[12px] items-start pb-[20px] relative shrink-0 w-full"
      data-name="Filter-Group"
    >
      <div
        aria-hidden
        className="absolute border-[#e0e0e0] border-b border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] uppercase whitespace-nowrap">
        Ціна
      </p>
      <GroupContent3 />
    </div>
  );
}

function ApplyBtn() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex flex-col items-center justify-center py-[12px] relative shrink-0 w-full"
      data-name="apply-btn"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[13px] text-white whitespace-nowrap">
        Застосувати
      </p>
    </div>
  );
}

function SidebarFilters() {
  return (
    <div
      className="bg-white content-stretch flex flex-col gap-[20px] items-start p-[16px] relative shrink-0 w-[240px]"
      data-name="sidebar-filters"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <TitleRow />
      <FilterGroup />
      <FilterGroup1 />
      <FilterGroup2 />
      <FilterGroup3 />
      <ApplyBtn />
    </div>
  );
}

function Chip() {
  return (
    <div
      className="content-stretch flex items-center px-[10px] py-[6px] relative shrink-0"
      data-name="chip-1"
    >
      <div
        aria-hidden
        className="absolute border border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#e53935] text-[12px] whitespace-nowrap">
        Міжкімнатні ×
      </p>
    </div>
  );
}

function Chip1() {
  return (
    <div
      className="content-stretch flex items-center px-[10px] py-[6px] relative shrink-0"
      data-name="chip-2"
    >
      <div
        aria-hidden
        className="absolute border border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#e53935] text-[12px] whitespace-nowrap">
        Білий ×
      </p>
    </div>
  );
}

function FilterChipsRow() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full"
      data-name="filter-chips-row"
    >
      <p className="[word-break:break-word] font-medium font-medium leading-[normal] relative shrink-0 text-[#9e9e9e] text-[13px] whitespace-nowrap">
        Активні фільтри:
      </p>
      <Chip />
      <Chip1 />
    </div>
  );
}

function SaleBadge() {
  return (
    <div
      className="absolute bg-[#e53935] content-stretch flex items-start left-0 px-[10px] py-[4px] top-0"
      data-name="sale-badge"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[11px] text-white whitespace-nowrap">
        -18%
      </p>
    </div>
  );
}

function CardImageBox() {
  return (
    <div
      className="content-stretch flex h-[420px] items-start relative shrink-0 w-full"
      data-name="card-image-box"
    >
      <img
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgCardImageBox}
      />
      <SaleBadge />
    </div>
  );
}

function CardInfo() {
  return (
    <div className="h-[54px] relative shrink-0 w-full" data-name="card-info">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[normal] p-[14px] relative size-full whitespace-nowrap">
        <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[15px]">
          Porta CPL 1.1
        </p>
        <p className="font-light font-light relative shrink-0 text-[#9e9e9e] text-[12px]">
          МДФ | Екошпон
        </p>
      </div>
    </div>
  );
}

function PricesRow() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex gap-[8px] items-baseline leading-[normal] px-[4px] relative shrink-0 w-[104px] whitespace-nowrap"
      data-name="prices-row"
    >
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[16px]">
        ₴ 4850
      </p>
      <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-from-font decoration-solid font-normal font-normal line-through relative shrink-0 text-[#9e9e9e] text-[12px]">
        ₴ 5900
      </p>
    </div>
  );
}

function ShoppingCart() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="shopping-cart">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="18"
        preserveAspectRatio="none"
        viewBox="0 0 18 18"
        width="18"
      >
        <g clipPath="url(#clip0_0_10)" id="shopping-cart">
          <path
            d={svgPaths.p39369500}
            id="Vector"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_10">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function AddToCartButton() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex items-start p-[12px] relative shrink-0"
      data-name="AddToCartButton"
    >
      <ShoppingCart />
    </div>
  );
}

function Purschase() {
  return (
    <div className="h-[55px] relative shrink-0 w-full" data-name="purschase">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[136px] items-center px-[10px] relative size-full">
          <PricesRow />
          <AddToCartButton />
        </div>
      </div>
    </div>
  );
}

function ProductCard() {
  return (
    <div
      className="bg-white h-[529px] relative shrink-0 w-[320px]"
      data-name="product-card"
    >
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <CardImageBox />
        <CardInfo />
        <Purschase />
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function CardImageBox1() {
  return (
    <div
      className="h-[420px] relative shrink-0 w-full"
      data-name="card-image-box"
    >
      <img
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgCardImageBox1}
      />
    </div>
  );
}

function CardInfo1() {
  return (
    <div className="h-[54px] relative shrink-0 w-full" data-name="card-info">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[normal] p-[14px] relative size-full whitespace-nowrap">
        <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[15px]">
          Darumi Plato
        </p>
        <p className="font-light font-light relative shrink-0 text-[#9e9e9e] text-[12px]">
          Масив | Шпон
        </p>
      </div>
    </div>
  );
}

function PricesRow1() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex gap-[8px] items-baseline leading-[normal] px-[4px] relative shrink-0 w-[104px] whitespace-nowrap"
      data-name="prices-row"
    >
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[16px]">
        ₴ 4850
      </p>
      <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-from-font decoration-solid font-normal font-normal line-through relative shrink-0 text-[#9e9e9e] text-[12px]">
        ₴ 5900
      </p>
    </div>
  );
}

function ShoppingCart1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="shopping-cart">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="18"
        preserveAspectRatio="none"
        viewBox="0 0 18 18"
        width="18"
      >
        <g clipPath="url(#clip0_0_10)" id="shopping-cart">
          <path
            d={svgPaths.p39369500}
            id="Vector"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_10">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function AddToCartButton1() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex items-start p-[12px] relative shrink-0"
      data-name="AddToCartButton"
    >
      <ShoppingCart1 />
    </div>
  );
}

function Purschase1() {
  return (
    <div className="h-[55px] relative shrink-0 w-full" data-name="purschase">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[136px] items-center px-[10px] relative size-full">
          <PricesRow1 />
          <AddToCartButton1 />
        </div>
      </div>
    </div>
  );
}

function ProductCard1() {
  return (
    <div
      className="bg-white relative shrink-0 w-[320px]"
      data-name="product-card"
    >
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <CardImageBox1 />
        <CardInfo1 />
        <Purschase1 />
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function CardImageBox2() {
  return (
    <div
      className="h-[420px] relative shrink-0 w-full"
      data-name="card-image-box"
    >
      <img
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgCardImageBox2}
      />
    </div>
  );
}

function PricesRow2() {
  return (
    <div
      className="content-stretch flex items-baseline relative shrink-0 w-full"
      data-name="prices-row"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[16px] whitespace-nowrap">
        ₴ 3950
      </p>
    </div>
  );
}

function AddToCartBtn() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex flex-col items-center justify-center py-[10px] relative shrink-0 w-full"
      data-name="add-to-cart-btn"
    >
      <div
        aria-hidden
        className="absolute border border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[13px] text-white whitespace-nowrap">
        В кошик
      </p>
    </div>
  );
}

function CardInfo2() {
  return (
    <div className="relative shrink-0 w-full" data-name="card-info">
      <div className="content-stretch flex flex-col gap-[6px] items-start p-[14px] relative size-full">
        <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap">
          Terminus Sweet
        </p>
        <p className="[word-break:break-word] font-light font-light leading-[normal] relative shrink-0 text-[#9e9e9e] text-[12px] whitespace-nowrap">
          МДФ | Скло
        </p>
        <PricesRow2 />
        <AddToCartBtn />
      </div>
    </div>
  );
}

function ProductCard2() {
  return (
    <div
      className="bg-white relative shrink-0 w-[320px]"
      data-name="product-card"
    >
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <CardImageBox2 />
        <CardInfo2 />
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function SaleBadge1() {
  return (
    <div
      className="absolute bg-[#e53935] content-stretch flex items-start left-0 px-[10px] py-[4px] top-0"
      data-name="sale-badge"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[11px] text-white whitespace-nowrap">
        -19%
      </p>
    </div>
  );
}

function CardImageBox3() {
  return (
    <div
      className="content-stretch flex h-[420px] items-start relative shrink-0 w-full"
      data-name="card-image-box"
    >
      <img
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgCardImageBox}
      />
      <SaleBadge1 />
    </div>
  );
}

function PricesRow3() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex gap-[8px] items-baseline leading-[normal] relative shrink-0 w-full whitespace-nowrap"
      data-name="prices-row"
    >
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[16px]">
        ₴ 5100
      </p>
      <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-from-font decoration-solid font-normal font-normal line-through relative shrink-0 text-[#9e9e9e] text-[12px]">
        ₴ 6300
      </p>
    </div>
  );
}

function AddToCartBtn1() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex flex-col items-center justify-center py-[10px] relative shrink-0 w-full"
      data-name="add-to-cart-btn"
    >
      <div
        aria-hidden
        className="absolute border border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[13px] text-white whitespace-nowrap">
        В кошик
      </p>
    </div>
  );
}

function CardInfo3() {
  return (
    <div className="relative shrink-0 w-full" data-name="card-info">
      <div className="content-stretch flex flex-col gap-[6px] items-start p-[14px] relative size-full">
        <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap">
          Leador Lorenza
        </p>
        <p className="[word-break:break-word] font-light font-light leading-[normal] relative shrink-0 text-[#9e9e9e] text-[12px] whitespace-nowrap">
          Екошпон
        </p>
        <PricesRow3 />
        <AddToCartBtn1 />
      </div>
    </div>
  );
}

function ProductCard3() {
  return (
    <div
      className="bg-white relative shrink-0 w-[320px]"
      data-name="product-card"
    >
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <CardImageBox3 />
        <CardInfo3 />
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function CardImageBox4() {
  return (
    <div
      className="h-[420px] relative shrink-0 w-full"
      data-name="card-image-box"
    >
      <img
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgCardImageBox1}
      />
    </div>
  );
}

function PricesRow4() {
  return (
    <div
      className="content-stretch flex items-baseline relative shrink-0 w-full"
      data-name="prices-row"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[16px] whitespace-nowrap">
        ₴ 8400
      </p>
    </div>
  );
}

function AddToCartBtn2() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex flex-col items-center justify-center py-[10px] relative shrink-0 w-full"
      data-name="add-to-cart-btn"
    >
      <div
        aria-hidden
        className="absolute border border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[13px] text-white whitespace-nowrap">
        В кошик
      </p>
    </div>
  );
}

function CardInfo4() {
  return (
    <div className="relative shrink-0 w-full" data-name="card-info">
      <div className="content-stretch flex flex-col gap-[6px] items-start p-[14px] relative size-full">
        <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap">
          Porta Balance 1
        </p>
        <p className="[word-break:break-word] font-light font-light leading-[normal] relative shrink-0 text-[#9e9e9e] text-[12px] whitespace-nowrap">
          Масив | МДФ
        </p>
        <PricesRow4 />
        <AddToCartBtn2 />
      </div>
    </div>
  );
}

function ProductCard4() {
  return (
    <div
      className="bg-white relative shrink-0 w-[320px]"
      data-name="product-card"
    >
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <CardImageBox4 />
        <CardInfo4 />
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function CardImageBox5() {
  return (
    <div
      className="h-[420px] relative shrink-0 w-full"
      data-name="card-image-box"
    >
      <img
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgCardImageBox2}
      />
    </div>
  );
}

function PricesRow5() {
  return (
    <div
      className="content-stretch flex items-baseline relative shrink-0 w-full"
      data-name="prices-row"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[16px] whitespace-nowrap">
        ₴ 6150
      </p>
    </div>
  );
}

function AddToCartBtn3() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex flex-col items-center justify-center py-[10px] relative shrink-0 w-full"
      data-name="add-to-cart-btn"
    >
      <div
        aria-hidden
        className="absolute border border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[13px] text-white whitespace-nowrap">
        В кошик
      </p>
    </div>
  );
}

function CardInfo5() {
  return (
    <div className="relative shrink-0 w-full" data-name="card-info">
      <div className="content-stretch flex flex-col gap-[6px] items-start p-[14px] relative size-full">
        <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap">
          Terminus Nanoflex
        </p>
        <p className="[word-break:break-word] font-light font-light leading-[normal] relative shrink-0 text-[#9e9e9e] text-[12px] whitespace-nowrap">
          Екошпон | Скло
        </p>
        <PricesRow5 />
        <AddToCartBtn3 />
      </div>
    </div>
  );
}

function ProductCard5() {
  return (
    <div
      className="bg-white relative shrink-0 w-[320px]"
      data-name="product-card"
    >
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <CardImageBox5 />
        <CardInfo5 />
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function ProductGrid() {
  return (
    <div
      className="content-start flex flex-wrap gap-[24px] items-start relative shrink-0 w-full"
      data-name="product-grid"
    >
      <ProductCard />
      <ProductCard1 />
      <ProductCard2 />
      <ProductCard3 />
      <ProductCard4 />
      <ProductCard5 />
    </div>
  );
}

function PrevBtn() {
  return (
    <div
      className="content-stretch flex items-start px-[16px] py-[8px] relative shrink-0"
      data-name="prev-btn"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        Назад
      </p>
    </div>
  );
}

function PageNumActive() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex items-start px-[12px] py-[8px] relative shrink-0"
      data-name="page-num-active"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[13px] text-white whitespace-nowrap">
        1
      </p>
    </div>
  );
}

function PageNum() {
  return (
    <div
      className="content-stretch flex items-start px-[12px] py-[8px] relative shrink-0"
      data-name="page-num"
    >
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        2
      </p>
    </div>
  );
}

function PageNum1() {
  return (
    <div
      className="content-stretch flex items-start px-[12px] py-[8px] relative shrink-0"
      data-name="page-num"
    >
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        3
      </p>
    </div>
  );
}

function PageNum2() {
  return (
    <div
      className="content-stretch flex items-start px-[12px] py-[8px] relative shrink-0"
      data-name="page-num"
    >
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        8
      </p>
    </div>
  );
}

function Pages() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0"
      data-name="pages"
    >
      <PageNumActive />
      <PageNum />
      <PageNum1 />
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#9e9e9e] text-[13px] whitespace-nowrap">
        ...
      </p>
      <PageNum2 />
    </div>
  );
}

function NextBtn() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex items-start px-[16px] py-[8px] relative shrink-0"
      data-name="next-btn"
    >
      <div
        aria-hidden
        className="absolute border border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[13px] text-white whitespace-nowrap">
        Вперед
      </p>
    </div>
  );
}

function PaginationRow() {
  return (
    <div
      className="content-stretch flex items-center justify-between py-[16px] relative shrink-0 w-full"
      data-name="pagination-row"
    >
      <div
        aria-hidden
        className="absolute border-[#e0e0e0] border-solid border-t inset-0 pointer-events-none"
      />
      <PrevBtn />
      <Pages />
      <NextBtn />
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
      <div className="content-stretch flex items-start px-[390px] py-[16px] relative size-full">
        <LoadMoreBtn />
      </div>
    </div>
  );
}

function MainCatalogColumn() {
  return (
    <div
      className="content-stretch flex flex-[1_0_0] flex-col gap-[40px] items-start min-w-px relative"
      data-name="main-catalog-column"
    >
      <FilterChipsRow />
      <ProductGrid />
      <PaginationRow />
      <LoadMore />
    </div>
  );
}

function SplitLayout() {
  return (
    <div
      className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full"
      data-name="split-layout"
    >
      <SidebarFilters />
      <MainCatalogColumn />
    </div>
  );
}

function PageBodyContainer() {
  return (
    <div className="relative shrink-0 w-full" data-name="page-body-container">
      <div className="content-stretch flex flex-col gap-[24px] items-start pb-[64px] pt-[24px] px-[80px] relative size-full">
        <Breadcrumb />
        <TitleBar />
        <SplitLayout />
      </div>
    </div>
  );
}

function Logo1() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0"
      data-name="logo"
    >
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[38px]" data-name="brand-icon">
            <img
              alt=""
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
              src={imgBrandIcon}
            />
          </div>
        </div>
      </div>
      <p className="[word-break:break-word] font-bold font-bold leading-[0] relative shrink-0 text-[18px] text-white whitespace-nowrap">
        <span className="leading-[normal]">{`НОВА ПІДЛОГА `}</span>
        <span className="font-medium font-medium leading-[normal] text-[#e53935]">
          ТА ДВЕРІ
        </span>
      </p>
    </div>
  );
}

function BrandColumn() {
  return (
    <div
      className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[380px]"
      data-name="brand-column"
    >
      <Logo1 />
      <p className="[word-break:break-word] font-light font-light leading-[1.5] min-w-full opacity-75 relative shrink-0 text-[13px] text-white w-[min-content]">
        Широкий асортимент сертифікованого підлогового покриття та міжкімнатних
        дверей в наявності та під замовлення у Черкасах.
      </p>
    </div>
  );
}

function LinksColumn() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-start leading-[normal] relative shrink-0 text-white w-[200px] whitespace-nowrap"
      data-name="links-column"
    >
      <p className="font-bold font-bold relative shrink-0 text-[14px] uppercase">
        Продукція
      </p>
      <p className="font-light font-light opacity-70 relative shrink-0 text-[13px]">
        Міжкімнатні двері
      </p>
      <p className="font-light font-light opacity-70 relative shrink-0 text-[13px]">
        Вхідні двері
      </p>
      <p className="font-light font-light opacity-70 relative shrink-0 text-[13px]">
        Фурнітура
      </p>
      <p className="font-light font-light opacity-70 relative shrink-0 text-[13px]">
        Ламінат
      </p>
      <p className="font-light font-light opacity-70 relative shrink-0 text-[13px]">
        Вініл
      </p>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="14"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
        width="14"
      >
        <g clipPath="url(#clip0_0_14)" id="Icon">
          <path
            d={svgPaths.p34c729f0}
            id="Vector"
            stroke="#E53935"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_14">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function PhoneRow() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full"
      data-name="phone-row"
    >
      <Icon4 />
      <p className="[word-break:break-word] font-medium font-medium leading-[normal] relative shrink-0 text-[13px] text-white whitespace-nowrap">
        +38 (097) 123-45-67
      </p>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="14"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
        width="14"
      >
        <g clipPath="url(#clip0_0_23)" id="Icon">
          <path
            d={svgPaths.p25444980}
            id="Vector"
            stroke="#E53935"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_23">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function AddressRow() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full"
      data-name="address-row"
    >
      <Icon5 />
      <p className="[word-break:break-word] font-light font-light leading-[normal] opacity-75 relative shrink-0 text-[13px] text-white whitespace-nowrap">
        м. Черкаси, вул. Смілянська, 120
      </p>
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="14"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
        width="14"
      >
        <g clipPath="url(#clip0_0_8)" id="Icon">
          <path
            d={svgPaths.p1b7b00f0}
            id="Vector"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_8">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function SocialBox() {
  return (
    <div
      className="bg-[#2a2a2a] content-stretch flex flex-col items-start p-[6px] relative shrink-0"
      data-name="social-box"
    >
      <Icon6 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="14"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
        width="14"
      >
        <g clipPath="url(#clip0_0_6)" id="Icon">
          <path
            d={svgPaths.pa405c00}
            id="Vector"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_6">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function SocialBox1() {
  return (
    <div
      className="bg-[#2a2a2a] content-stretch flex flex-col items-start p-[6px] relative shrink-0"
      data-name="social-box"
    >
      <Icon7 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="14"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
        width="14"
      >
        <g clipPath="url(#clip0_0_4)" id="Icon">
          <path
            d={svgPaths.p1a610e80}
            id="Vector"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_4">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function SocialBox2() {
  return (
    <div
      className="bg-[#2a2a2a] content-stretch flex flex-col items-start p-[6px] relative shrink-0"
      data-name="social-box"
    >
      <Icon8 />
    </div>
  );
}

function FooterSocials() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center pt-[8px] relative shrink-0"
      data-name="footer-socials"
    >
      <SocialBox />
      <SocialBox1 />
      <SocialBox2 />
    </div>
  );
}

function ContactsColumn() {
  return (
    <div
      className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start min-w-px relative"
      data-name="contacts-column"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[14px] text-white uppercase whitespace-nowrap">
        Контакти
      </p>
      <PhoneRow />
      <AddressRow />
      <FooterSocials />
    </div>
  );
}

function FooterMain() {
  return (
    <div
      className="content-stretch flex gap-[64px] items-start relative shrink-0 w-full"
      data-name="footer-main"
    >
      <BrandColumn />
      <LinksColumn />
      <ContactsColumn />
    </div>
  );
}

function FooterBottom() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex font-light font-light items-center justify-between leading-[normal] relative shrink-0 text-[12px] text-white w-full whitespace-nowrap"
      data-name="footer-bottom"
    >
      <p className="opacity-60 relative shrink-0">
        © 2025 Нова підлога та Двері. Всі права захищені.
      </p>
      <p className="opacity-40 relative shrink-0">
        Розробка сайту • Porto Studio
      </p>
    </div>
  );
}

function DesktopFooter() {
  return (
    <div
      className="bg-[#1a1a1a] relative shrink-0 w-full"
      data-name="desktop-footer"
    >
      <div className="content-stretch flex flex-col gap-[32px] items-start pb-[24px] pt-[48px] px-[80px] relative size-full">
        <FooterMain />
        <div
          className="bg-white h-px opacity-12 relative shrink-0 w-full"
          data-name="divider"
        />
        <FooterBottom />
      </div>
    </div>
  );
}

export default function DoorsCatalogDesktop() {
  return (
    <div
      className="bg-white content-stretch flex flex-col items-start relative size-full"
      data-name="doors-catalog-desktop"
    >
      <HeaderWrapper />
      <PageBodyContainer />
      <DesktopFooter />
    </div>
  );
}
