import svgPaths from "./svg-auya8s2p9b";
import imgBrandIcon from "./87302d1f38e17f3e79cfa3ba4347f6dc47793a0a.png";
import imgPhotoFrame from "./12748a82b58a1ba0899af80c52b4ece5bd10a4a0.png";
import imgThumbImg from "./66ee30763c701b946d31d4a89fa9b881e945ebc7.png";
import imgThumbImg1 from "./dea6af5dc98d8732a49f5cd4d773583ffbe59c60.png";
import imgThumbImg2 from "./5f3b642c10325efff062edf7d844a3fb5db092ab.png";
import imgThumbImg3 from "./9c9ae8000f7a2b5369fed306b98f7e7c4e210b80.png";
import imgThumbImg4 from "./e5ad03b71d27097fba6c8966345b0c76a54b0681.png";
import imgThumbImg5 from "./80458d1116bff8a27b95b398413f48900542a46c.png";
import imgSwatchImg from "./5963f0a4e4b6c13982dbf0d74b4a6310ab935ba7.png";
import imgSwatchImg1 from "./66b7f495ef838062c443ee3b36b787f67f2f802a.png";
import imgSwatchImg2 from "./ef715a3221f51fc937765c6fe9a36af463afaef8.png";
import imgSwatchImg3 from "./d7849bec0fde8d8bf1ff4b281b5c054a640327fc.png";
import imgSwatchImg4 from "./87cd0a7a3561eb7916f992578cc3aa3bc98117d5.png";
import imgSwatchImg5 from "./3883123f900cf06edfe6efaf5f2835003b23d93f.png";

function IconMapPin() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon-map-pin">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="12"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
        width="12"
      >
        <g clipPath="url(#clip0_0_47)" id="Icon-map-pin">
          <path
            d={svgPaths.p1acf0ed1}
            id="Vector"
            stroke="#E53935"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_47">
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
      <IconMapPin />
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] opacity-80 relative shrink-0 text-[13px] text-white whitespace-nowrap">
        м. Черкаси, Україна
      </p>
    </div>
  );
}

function IconPhone() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon-phone">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="12"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
        width="12"
      >
        <g clipPath="url(#clip0_0_40)" id="Icon-phone">
          <path
            d={svgPaths.p3b9bbc80}
            id="Vector"
            stroke="#E53935"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_40">
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
      <IconPhone />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[13px] text-white whitespace-nowrap">
        +38 (097) 123-45-67
      </p>
    </div>
  );
}

function TopLeft() {
  return (
    <div
      className="content-stretch flex gap-[24px] items-center relative shrink-0"
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
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[80px] py-[8px] relative size-full">
          <TopLeft />
          <p className="[word-break:break-word] font-normal font-normal leading-[normal] opacity-60 relative shrink-0 text-[13px] text-white whitespace-nowrap">
            Доставка та професійне встановлення по Черкаській області
          </p>
        </div>
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

function Icon() {
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
        <g clipPath="url(#clip0_0_34)" id="Icon">
          <path
            d={svgPaths.p8360680}
            id="Vector"
            stroke="#1A1A1A"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_34">
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
      <Icon />
    </div>
  );
}

function CartCount() {
  return (
    <div
      className="absolute bg-[#e53935] content-stretch flex items-start px-[6px] py-[2px] right-[-2px] top-[-2px]"
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
      <p className="font-normal font-normal relative shrink-0 text-[#9e9e9e]">
        Каталог дверей
      </p>
      <p className="font-normal font-normal relative shrink-0 text-[#9e9e9e]">{` > `}</p>
      <p className="font-medium font-medium relative shrink-0 text-[#1a1a1a]">
        Porto CPL 1.1
      </p>
    </div>
  );
}

function TitleBlock() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[normal] relative shrink-0 w-full whitespace-nowrap"
      data-name="title-block"
    >
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[32px]">
        Porto CPL 1.1
      </p>
      <p className="font-medium font-medium relative shrink-0 text-[#9e9e9e] text-[14px]">
        Міжкімнатні двері / МДФ
      </p>
    </div>
  );
}

function ChevronLeft() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="chevron-left">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="18"
        preserveAspectRatio="none"
        viewBox="0 0 18 18"
        width="18"
      >
        <g id="chevron-left">
          <path
            d="M11.25 13.5L6.75 9L11.25 4.5"
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

function NavLeft() {
  return (
    <div
      className="-translate-y-1/2 absolute bg-white left-[16px] size-[48px] top-[calc(50%+4px)]"
      data-name="nav-left"
    >
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[inherit] size-full">
        <ChevronLeft />
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="chevron-right">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="18"
        preserveAspectRatio="none"
        viewBox="0 0 18 18"
        width="18"
      >
        <g id="chevron-right">
          <path
            d="M6.75 13.5L11.25 9L6.75 4.5"
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

function NavRight() {
  return (
    <div
      className="-translate-y-1/2 absolute bg-white right-[8px] size-[48px] top-[calc(50%+4px)]"
      data-name="nav-right"
    >
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[inherit] size-full">
        <ChevronRight />
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function ZoomIn() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="zoom-in">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="18"
        preserveAspectRatio="none"
        viewBox="0 0 18 18"
        width="18"
      >
        <g id="zoom-in">
          <path
            d={svgPaths.p392f6e00}
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

function IconSearchPlus() {
  return (
    <div
      className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[18px]"
      data-name="Icon-search-plus"
    >
      <ZoomIn />
    </div>
  );
}

function ZoomBtn() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.8)] content-stretch flex items-center justify-center p-[10px] right-[16px] top-[16px]"
      data-name="zoom-btn"
    >
      <IconSearchPlus />
    </div>
  );
}

function EdgeBadge() {
  return (
    <div
      className="absolute bg-[#1a1a1a] content-stretch flex gap-[6px] items-center left-[16px] px-[12px] py-[6px] top-[16px]"
      data-name="edge-badge"
    >
      <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
        <svg
          className="absolute block inset-0 size-full"
          fill="none"
          height="8"
          preserveAspectRatio="none"
          viewBox="0 0 8 8"
          width="8"
        >
          <circle cx="4" cy="4" fill="white" id="Ellipse" r="4" />
        </svg>
      </div>
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[12px] text-white whitespace-nowrap">
        Чорна матова кромка
      </p>
    </div>
  );
}

function PhotoFrame() {
  return (
    <div className="h-[600px] relative shrink-0 w-full" data-name="photo-frame">
      <img
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgPhotoFrame}
      />
      <div className="content-stretch flex items-start overflow-clip relative rounded-[inherit] size-full">
        <NavLeft />
        <NavRight />
        <ZoomBtn />
        <EdgeBadge />
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function ThumbActive() {
  return (
    <div className="relative shrink-0 size-[64px]" data-name="thumb-active">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <div
          className="flex-[1_0_0] min-h-px relative w-full"
          data-name="thumb-img"
        >
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            src={imgThumbImg}
          />
        </div>
      </div>
      <div
        aria-hidden
        className="absolute border-2 border-[#e53935] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function Thumb() {
  return (
    <div className="relative shrink-0 size-[64px]" data-name="thumb">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <div
          className="flex-[1_0_0] min-h-px relative w-full"
          data-name="thumb-img"
        >
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            src={imgThumbImg1}
          />
        </div>
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function Thumb1() {
  return (
    <div className="relative shrink-0 size-[64px]" data-name="thumb">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <div
          className="flex-[1_0_0] min-h-px relative w-full"
          data-name="thumb-img"
        >
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            src={imgThumbImg2}
          />
        </div>
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function Thumb2() {
  return (
    <div className="relative shrink-0 size-[64px]" data-name="thumb">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <div
          className="flex-[1_0_0] min-h-px relative w-full"
          data-name="thumb-img"
        >
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            src={imgThumbImg3}
          />
        </div>
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function Thumb3() {
  return (
    <div className="relative shrink-0 size-[64px]" data-name="thumb">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <div
          className="flex-[1_0_0] min-h-px relative w-full"
          data-name="thumb-img"
        >
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            src={imgThumbImg4}
          />
        </div>
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function Thumb4() {
  return (
    <div className="relative shrink-0 size-[64px]" data-name="thumb">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <div
          className="flex-[1_0_0] min-h-px relative w-full"
          data-name="thumb-img"
        >
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            src={imgThumbImg5}
          />
        </div>
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function Thumbnails() {
  return (
    <div
      className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full"
      data-name="thumbnails"
    >
      <ThumbActive />
      <Thumb />
      <Thumb1 />
      <Thumb2 />
      <Thumb3 />
      <Thumb4 />
    </div>
  );
}

function Dots() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 w-full"
      data-name="dots"
    >
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg
          className="absolute block inset-0 size-full"
          fill="none"
          height="6"
          preserveAspectRatio="none"
          viewBox="0 0 6 6"
          width="6"
        >
          <circle cx="3" cy="3" fill="#E53935" id="Ellipse" r="3" />
        </svg>
      </div>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg
          className="absolute block inset-0 size-full"
          fill="none"
          height="6"
          preserveAspectRatio="none"
          viewBox="0 0 6 6"
          width="6"
        >
          <circle cx="3" cy="3" fill="#9E9E9E" id="Ellipse" r="3" />
        </svg>
      </div>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg
          className="absolute block inset-0 size-full"
          fill="none"
          height="6"
          preserveAspectRatio="none"
          viewBox="0 0 6 6"
          width="6"
        >
          <circle cx="3" cy="3" fill="#9E9E9E" id="Ellipse" r="3" />
        </svg>
      </div>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg
          className="absolute block inset-0 size-full"
          fill="none"
          height="6"
          preserveAspectRatio="none"
          viewBox="0 0 6 6"
          width="6"
        >
          <circle cx="3" cy="3" fill="#9E9E9E" id="Ellipse" r="3" />
        </svg>
      </div>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg
          className="absolute block inset-0 size-full"
          fill="none"
          height="6"
          preserveAspectRatio="none"
          viewBox="0 0 6 6"
          width="6"
        >
          <circle cx="3" cy="3" fill="#9E9E9E" id="Ellipse" r="3" />
        </svg>
      </div>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg
          className="absolute block inset-0 size-full"
          fill="none"
          height="6"
          preserveAspectRatio="none"
          viewBox="0 0 6 6"
          width="6"
        >
          <circle cx="3" cy="3" fill="#9E9E9E" id="Ellipse" r="3" />
        </svg>
      </div>
    </div>
  );
}

function VisualPreview() {
  return (
    <div
      className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px relative"
      data-name="visual-preview"
    >
      <PhotoFrame />
      <Thumbnails />
      <Dots />
    </div>
  );
}

function StepHeader() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] relative shrink-0 w-full whitespace-nowrap"
      data-name="step-header"
    >
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[15px]">
        Крок 1: Тип покриття
      </p>
      <p className="font-semibold font-semibold relative shrink-0 text-[#9e9e9e] text-[13px]">
        1/4
      </p>
    </div>
  );
}

function SegmentSincrolam() {
  return (
    <div
      className="bg-white flex-[1_0_0] min-w-px relative"
      data-name="segment-sincrolam"
    >
      <div
        aria-hidden
        className="absolute border-2 border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-[12px] relative size-full">
          <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#e53935] text-[13px] whitespace-nowrap">
            Sincrolam®
          </p>
        </div>
      </div>
    </div>
  );
}

function SegmentPp() {
  return (
    <div
      className="bg-white flex-[1_0_0] min-w-px relative"
      data-name="segment-pp"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-[12px] relative size-full">
          <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
            PP
          </p>
        </div>
      </div>
    </div>
  );
}

function SegmentSuperPet() {
  return (
    <div
      className="bg-white flex-[1_0_0] min-w-px relative"
      data-name="segment-super-pet"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-[12px] relative size-full">
          <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
            Super PET
          </p>
        </div>
      </div>
    </div>
  );
}

function CoatingSegments() {
  return (
    <div
      className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full"
      data-name="coating-segments"
    >
      <SegmentSincrolam />
      <SegmentPp />
      <SegmentSuperPet />
    </div>
  );
}

function StepCoating() {
  return (
    <div
      className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full"
      data-name="step-coating"
    >
      <StepHeader />
      <CoatingSegments />
    </div>
  );
}

function ColorTitle() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0"
      data-name="color-title"
    >
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[15px]">
        Крок 2: Колір
      </p>
      <p className="font-medium font-medium relative shrink-0 text-[#9e9e9e] text-[13px]">
        (не впливає на ціну)
      </p>
    </div>
  );
}

function ColorHeader() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] relative shrink-0 w-full whitespace-nowrap"
      data-name="color-header"
    >
      <ColorTitle />
      <p className="font-semibold font-semibold relative shrink-0 text-[#9e9e9e] text-[13px]">
        2/4
      </p>
    </div>
  );
}

function SwatchDubBileny() {
  return (
    <div
      className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-[72px]"
      data-name="swatch-dub-bileny"
    >
      <div
        className="pointer-events-none relative shrink-0 size-[72px]"
        data-name="swatch-img"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover size-full"
          src={imgSwatchImg}
        />
        <div
          aria-hidden
          className="absolute border-2 border-[#e53935] border-solid inset-0"
        />
      </div>
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[11px] text-center text-ellipsis whitespace-nowrap">
        Дуб білений
      </p>
    </div>
  );
}

function SwatchGorih() {
  return (
    <div
      className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-[72px]"
      data-name="swatch-gorih"
    >
      <div
        className="pointer-events-none relative shrink-0 size-[72px]"
        data-name="swatch-img"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover size-full"
          src={imgSwatchImg1}
        />
        <div
          aria-hidden
          className="absolute border border-[#e0e0e0] border-solid inset-0"
        />
      </div>
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[11px] text-center text-ellipsis whitespace-nowrap">
        Горіх
      </p>
    </div>
  );
}

function SwatchDubGrey() {
  return (
    <div
      className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-[72px]"
      data-name="swatch-dub-grey"
    >
      <div
        className="pointer-events-none relative shrink-0 size-[72px]"
        data-name="swatch-img"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover size-full"
          src={imgSwatchImg2}
        />
        <div
          aria-hidden
          className="absolute border border-[#e0e0e0] border-solid inset-0"
        />
      </div>
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[11px] text-center text-ellipsis whitespace-nowrap">
        Дуб грей
      </p>
    </div>
  );
}

function SwatchEshWhite() {
  return (
    <div
      className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-[72px]"
      data-name="swatch-esh-white"
    >
      <div
        className="pointer-events-none relative shrink-0 size-[72px]"
        data-name="swatch-img"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover size-full"
          src={imgSwatchImg3}
        />
        <div
          aria-hidden
          className="absolute border border-[#e0e0e0] border-solid inset-0"
        />
      </div>
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[11px] text-center text-ellipsis whitespace-nowrap">
        Еш-вайт
      </p>
    </div>
  );
}

function SwatchStalKorten() {
  return (
    <div
      className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-[72px]"
      data-name="swatch-stal-korten"
    >
      <div
        className="pointer-events-none relative shrink-0 size-[72px]"
        data-name="swatch-img"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover size-full"
          src={imgSwatchImg4}
        />
        <div
          aria-hidden
          className="absolute border border-[#e0e0e0] border-solid inset-0"
        />
      </div>
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[11px] text-center text-ellipsis whitespace-nowrap">
        Сталь кортен
      </p>
    </div>
  );
}

function SwatchArtBeton() {
  return (
    <div
      className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-[72px]"
      data-name="swatch-art-beton"
    >
      <div
        className="pointer-events-none relative shrink-0 size-[72px]"
        data-name="swatch-img"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover size-full"
          src={imgSwatchImg5}
        />
        <div
          aria-hidden
          className="absolute border border-[#e0e0e0] border-solid inset-0"
        />
      </div>
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[11px] text-center text-ellipsis whitespace-nowrap">
        Арт бетон
      </p>
    </div>
  );
}

function ColorSwatches() {
  return (
    <div
      className="content-start flex flex-wrap gap-[10px] items-start relative shrink-0 w-full"
      data-name="color-swatches"
    >
      <SwatchDubBileny />
      <SwatchGorih />
      <SwatchDubGrey />
      <SwatchEshWhite />
      <SwatchStalKorten />
      <SwatchArtBeton />
    </div>
  );
}

function StepColor() {
  return (
    <div
      className="content-stretch flex flex-col gap-[14px] items-start opacity-95 relative shrink-0 w-full"
      data-name="step-color"
    >
      <ColorHeader />
      <ColorSwatches />
    </div>
  );
}

function EdgeHeader() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] relative shrink-0 w-full whitespace-nowrap"
      data-name="edge-header"
    >
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[15px]">
        Крок 3: Кромка
      </p>
      <p className="font-semibold font-semibold relative shrink-0 text-[#9e9e9e] text-[13px]">
        3/4
      </p>
    </div>
  );
}

function PillOrdinary() {
  return (
    <div
      className="bg-white flex-[1_0_0] min-w-px relative"
      data-name="pill-ordinary"
    >
      <div
        aria-hidden
        className="absolute border-2 border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[10px] relative size-full">
          <div
            className="bg-[#9e9e9e] h-[14px] relative rounded-[2px] shrink-0 w-[4px]"
            data-name="Rectangle"
          />
          <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
            Звичайна
          </p>
          <p className="[word-break:break-word] font-medium font-medium leading-[normal] relative shrink-0 text-[#9e9e9e] text-[12px] whitespace-nowrap">
            +₴0
          </p>
        </div>
      </div>
    </div>
  );
}

function PillMatteBlack() {
  return (
    <div
      className="bg-white flex-[1_0_0] min-w-px relative"
      data-name="pill-matte-black"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[10px] relative size-full">
          <div
            className="bg-[#1a1a1a] h-[14px] relative rounded-[2px] shrink-0 w-[4px]"
            data-name="Rectangle"
          />
          <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
            Чорна матова
          </p>
          <p className="[word-break:break-word] font-medium font-medium leading-[normal] relative shrink-0 text-[#9e9e9e] text-[12px] whitespace-nowrap">
            +₴165
          </p>
        </div>
      </div>
    </div>
  );
}

function Info() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="info">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="14"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
        width="14"
      >
        <g clipPath="url(#clip0_0_38)" id="info">
          <path
            d={svgPaths.p10e41280}
            id="Vector"
            stroke="#9E9E9E"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_38">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconInfo() {
  return (
    <div
      className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[14px]"
      data-name="Icon-info"
    >
      <Info />
    </div>
  );
}

function PillAluminum() {
  return (
    <div
      className="bg-white flex-[1_0_0] min-w-px opacity-40 relative"
      data-name="pill-aluminum"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[10px] relative size-full">
          <div
            className="bg-[#bdc3c7] h-[14px] relative rounded-[2px] shrink-0 w-[4px]"
            data-name="Rectangle"
          />
          <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
            Алюмінієва
          </p>
          <p className="[word-break:break-word] font-medium font-medium leading-[normal] relative shrink-0 text-[#9e9e9e] text-[12px] whitespace-nowrap">
            +₴500
          </p>
          <IconInfo />
        </div>
      </div>
    </div>
  );
}

function PillContainer() {
  return (
    <div
      className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full"
      data-name="pill-container"
    >
      <PillOrdinary />
      <PillMatteBlack />
      <PillAluminum />
    </div>
  );
}

function StepEdge() {
  return (
    <div
      className="content-stretch flex flex-col gap-[14px] items-start opacity-90 relative shrink-0 w-full"
      data-name="step-edge"
    >
      <EdgeHeader />
      <PillContainer />
    </div>
  );
}

function SizeHeader() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] relative shrink-0 w-full whitespace-nowrap"
      data-name="size-header"
    >
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[15px]">
        Крок 4: Розмір
      </p>
      <p className="font-semibold font-semibold relative shrink-0 text-[#9e9e9e] text-[13px]">
        4/4
      </p>
    </div>
  );
}

function OptStandard() {
  return (
    <div
      className="bg-[#f7f7f7] flex-[1_0_0] min-w-px relative"
      data-name="opt-standard"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-[10px] relative size-full">
          <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
            Стандарт
          </p>
        </div>
      </div>
    </div>
  );
}

function OptCustom() {
  return (
    <div
      className="bg-white flex-[1_0_0] min-w-px relative"
      data-name="opt-custom"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-[10px] relative size-full">
          <p className="[word-break:break-word] font-medium font-medium leading-[normal] relative shrink-0 text-[#9e9e9e] text-[13px] whitespace-nowrap">
            Нестандарт
          </p>
        </div>
      </div>
    </div>
  );
}

function SizeToggle() {
  return (
    <div
      className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full"
      data-name="size-toggle"
    >
      <OptStandard />
      <OptCustom />
    </div>
  );
}

function InputField() {
  return (
    <div className="relative shrink-0 w-full" data-name="input-field">
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <div className="content-stretch flex items-start px-[14px] py-[10px] relative size-full">
        <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap">
          750
        </p>
      </div>
    </div>
  );
}

function InputWidth() {
  return (
    <div
      className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px relative"
      data-name="input-width"
    >
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#9e9e9e] text-[13px] whitespace-nowrap">
        Ширина, мм
      </p>
      <InputField />
    </div>
  );
}

function InputField1() {
  return (
    <div className="relative shrink-0 w-full" data-name="input-field">
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <div className="content-stretch flex items-start px-[14px] py-[10px] relative size-full">
        <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap">
          2050
        </p>
      </div>
    </div>
  );
}

function InputHeight() {
  return (
    <div
      className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px relative"
      data-name="input-height"
    >
      <p className="[word-break:break-word] font-normal font-normal leading-[normal] relative shrink-0 text-[#9e9e9e] text-[13px] whitespace-nowrap">
        Висота, мм
      </p>
      <InputField1 />
    </div>
  );
}

function SizeInputs() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full"
      data-name="size-inputs"
    >
      <InputWidth />
      <InputHeight />
    </div>
  );
}

function AlertCircle() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="alert-circle">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="16"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
        width="16"
      >
        <g clipPath="url(#clip0_0_20)" id="alert-circle">
          <path
            d={svgPaths.p42f0900}
            id="Vector"
            stroke="#E67E22"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_20">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconExclamation() {
  return (
    <div
      className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[16px]"
      data-name="Icon-exclamation"
    >
      <AlertCircle />
    </div>
  );
}

function WarningBanner() {
  return (
    <div
      className="bg-[#fef5ed] relative shrink-0 w-full"
      data-name="warning-banner"
    >
      <div
        aria-hidden
        className="absolute border-[#e67e22] border-l-4 border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center p-[12px] relative size-full">
          <IconExclamation />
          <p className="[word-break:break-word] flex-[1_0_0] font-medium font-medium leading-[normal] min-w-px relative text-[#e67e22] text-[13px]">
            Нестандартний розмір: націнка +15-20%
          </p>
        </div>
      </div>
    </div>
  );
}

function StepSize() {
  return (
    <div
      className="content-stretch flex flex-col gap-[14px] items-start opacity-90 relative shrink-0 w-full"
      data-name="step-size"
    >
      <SizeHeader />
      <SizeToggle />
      <SizeInputs />
      <WarningBanner />
    </div>
  );
}

function AccessoriesHeader() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[normal] relative shrink-0 w-full whitespace-nowrap"
      data-name="accessories-header"
    >
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[15px]">
        Комплектуючі
      </p>
      <p className="font-medium font-medium relative shrink-0 text-[#9e9e9e] text-[13px]">
        (додатково)
      </p>
    </div>
  );
}

function Package() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="package">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="20"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
        width="20"
      >
        <g id="package">
          <path
            d={svgPaths.p19b12c00}
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

function Thumb5() {
  return (
    <div
      className="bg-[#f7f7f7] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[48px]"
      data-name="thumb"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <Package />
    </div>
  );
}

function Info1() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative"
      data-name="info"
    >
      <p className="font-semibold font-semibold relative shrink-0 text-[#1a1a1a] text-[13px] w-full">
        Коробка МДФ Телескоп
      </p>
      <p className="font-normal font-normal relative shrink-0 text-[#9e9e9e] text-[12px] w-full">
        90×38 мм, з ущільнювачем
      </p>
    </div>
  );
}

function Price() {
  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0 w-[80px]"
      data-name="price"
    >
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        ₴1,020
      </p>
    </div>
  );
}

function BtnMinus() {
  return (
    <div
      className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[32px]"
      data-name="btn-minus"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[16px] whitespace-nowrap">
        −
      </p>
    </div>
  );
}

function Value() {
  return (
    <div
      className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[32px]"
      data-name="value"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        1
      </p>
    </div>
  );
}

function BtnPlus() {
  return (
    <div
      className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[32px]"
      data-name="btn-plus"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[16px] whitespace-nowrap">
        +
      </p>
    </div>
  );
}

function Stepper() {
  return (
    <div
      className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0"
      data-name="stepper"
    >
      <BtnMinus />
      <Value />
      <BtnPlus />
    </div>
  );
}

function AccessoryRow() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center py-[10px] relative shrink-0 w-full"
      data-name="accessory-row"
    >
      <Thumb5 />
      <Info1 />
      <Price />
      <Stepper />
    </div>
  );
}

function Sliders() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="sliders">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="20"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
        width="20"
      >
        <g id="sliders">
          <path
            d={svgPaths.p278c84c0}
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

function Thumb6() {
  return (
    <div
      className="bg-[#f7f7f7] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[48px]"
      data-name="thumb"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <Sliders />
    </div>
  );
}

function Info2() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative"
      data-name="info"
    >
      <p className="font-semibold font-semibold relative shrink-0 text-[#1a1a1a] text-[13px] w-full">
        Лиштва плоска МДФ
      </p>
      <p className="font-normal font-normal relative shrink-0 text-[#9e9e9e] text-[12px] w-full">
        70×10 мм, телескоп
      </p>
    </div>
  );
}

function Price1() {
  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0 w-[80px]"
      data-name="price"
    >
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        ₴446
      </p>
    </div>
  );
}

function BtnMinus1() {
  return (
    <div
      className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[32px]"
      data-name="btn-minus"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[16px] whitespace-nowrap">
        −
      </p>
    </div>
  );
}

function Value1() {
  return (
    <div
      className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[32px]"
      data-name="value"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        2
      </p>
    </div>
  );
}

function BtnPlus1() {
  return (
    <div
      className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[32px]"
      data-name="btn-plus"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[16px] whitespace-nowrap">
        +
      </p>
    </div>
  );
}

function Stepper1() {
  return (
    <div
      className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0"
      data-name="stepper"
    >
      <BtnMinus1 />
      <Value1 />
      <BtnPlus1 />
    </div>
  );
}

function AccessoryRow1() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center py-[10px] relative shrink-0 w-full"
      data-name="accessory-row"
    >
      <Thumb6 />
      <Info2 />
      <Price1 />
      <Stepper1 />
    </div>
  );
}

function Toolbox() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="toolbox">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="20"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
        width="20"
      >
        <g id="toolbox">
          <path
            d={svgPaths.p3a7ab5c0}
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

function Thumb7() {
  return (
    <div
      className="bg-[#f7f7f7] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[48px]"
      data-name="thumb"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <Toolbox />
    </div>
  );
}

function Info3() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative"
      data-name="info"
    >
      <p className="font-semibold font-semibold relative shrink-0 text-[#1a1a1a] text-[13px] w-full">
        Доборна планка
      </p>
      <p className="font-normal font-normal relative shrink-0 text-[#9e9e9e] text-[12px] w-full">
        100 мм, МДФ
      </p>
    </div>
  );
}

function Price2() {
  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0 w-[80px]"
      data-name="price"
    >
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        ₴320
      </p>
    </div>
  );
}

function BtnMinus2() {
  return (
    <div
      className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[32px]"
      data-name="btn-minus"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[16px] whitespace-nowrap">
        −
      </p>
    </div>
  );
}

function Value2() {
  return (
    <div
      className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[32px]"
      data-name="value"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        0
      </p>
    </div>
  );
}

function BtnPlus2() {
  return (
    <div
      className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[32px]"
      data-name="btn-plus"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[16px] whitespace-nowrap">
        +
      </p>
    </div>
  );
}

function Stepper2() {
  return (
    <div
      className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0"
      data-name="stepper"
    >
      <BtnMinus2 />
      <Value2 />
      <BtnPlus2 />
    </div>
  );
}

function AccessoryRow2() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center py-[10px] relative shrink-0 w-full"
      data-name="accessory-row"
    >
      <Thumb7 />
      <Info3 />
      <Price2 />
      <Stepper2 />
    </div>
  );
}

function Hand() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="hand">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="20"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
        width="20"
      >
        <g clipPath="url(#clip0_0_16)" id="hand">
          <path
            d={svgPaths.p29576e80}
            id="Vector"
            stroke="#9E9E9E"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_16">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Thumb8() {
  return (
    <div
      className="bg-[#f7f7f7] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[48px]"
      data-name="thumb"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <Hand />
    </div>
  );
}

function Info4() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative"
      data-name="info"
    >
      <p className="font-semibold font-semibold relative shrink-0 text-[#1a1a1a] text-[13px] w-full">
        Ручка дверна
      </p>
      <p className="font-normal font-normal relative shrink-0 text-[#9e9e9e] text-[12px] w-full">
        На розетці, хром матовий
      </p>
    </div>
  );
}

function Price3() {
  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0 w-[80px]"
      data-name="price"
    >
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        ₴580
      </p>
    </div>
  );
}

function Check() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="check">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="14"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
        width="14"
      >
        <g id="check">
          <path
            d={svgPaths.p27200700}
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

function Checkbox() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[20px]"
      data-name="checkbox"
    >
      <div
        aria-hidden
        className="absolute border border-[#e53935] border-solid inset-0 pointer-events-none"
      />
      <Check />
    </div>
  );
}

function AccessoryRow3() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center py-[10px] relative shrink-0 w-full"
      data-name="accessory-row"
    >
      <Thumb8 />
      <Info4 />
      <Price3 />
      <Checkbox />
    </div>
  );
}

function CircleX() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="circle-x">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="20"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
        width="20"
      >
        <g clipPath="url(#clip0_0_12)" id="circle-x">
          <path
            d={svgPaths.p30a06080}
            id="Vector"
            stroke="#9E9E9E"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_12">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Thumb9() {
  return (
    <div
      className="bg-[#f7f7f7] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[48px]"
      data-name="thumb"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <CircleX />
    </div>
  );
}

function Info5() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative"
      data-name="info"
    >
      <p className="font-semibold font-semibold relative shrink-0 text-[#1a1a1a] text-[13px] w-full">
        Петлі приховані
      </p>
      <p className="font-normal font-normal relative shrink-0 text-[#9e9e9e] text-[12px] w-full">
        Комплект 2 шт.
      </p>
    </div>
  );
}

function Price4() {
  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0 w-[80px]"
      data-name="price"
    >
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        ₴850
      </p>
    </div>
  );
}

function Checkbox1() {
  return (
    <div
      className="bg-white relative shrink-0 size-[20px]"
      data-name="checkbox"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function AccessoryRow4() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center py-[10px] relative shrink-0 w-full"
      data-name="accessory-row"
    >
      <Thumb9 />
      <Info5 />
      <Price4 />
      <Checkbox1 />
    </div>
  );
}

function Lock() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="lock">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="20"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
        width="20"
      >
        <g id="lock">
          <path
            d={svgPaths.p3ad10700}
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

function Thumb10() {
  return (
    <div
      className="bg-[#f7f7f7] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[48px]"
      data-name="thumb"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <Lock />
    </div>
  );
}

function Info6() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative"
      data-name="info"
    >
      <p className="font-semibold font-semibold relative shrink-0 text-[#1a1a1a] text-[13px] w-full">
        Замок магнітний
      </p>
      <p className="font-normal font-normal relative shrink-0 text-[#9e9e9e] text-[12px] w-full">
        Тихий хід
      </p>
    </div>
  );
}

function Price5() {
  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0 w-[80px]"
      data-name="price"
    >
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">
        ₴720
      </p>
    </div>
  );
}

function Checkbox2() {
  return (
    <div
      className="bg-white relative shrink-0 size-[20px]"
      data-name="checkbox"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function AccessoryRow5() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center py-[10px] relative shrink-0 w-full"
      data-name="accessory-row"
    >
      <Thumb10 />
      <Info6 />
      <Price5 />
      <Checkbox2 />
    </div>
  );
}

function AccessoriesList() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="accessories-list"
    >
      <AccessoryRow />
      <div
        className="bg-[#e0e0e0] h-px relative shrink-0 w-full"
        data-name="divider"
      />
      <AccessoryRow1 />
      <div
        className="bg-[#e0e0e0] h-px relative shrink-0 w-full"
        data-name="divider"
      />
      <AccessoryRow2 />
      <div
        className="bg-[#e0e0e0] h-px relative shrink-0 w-full"
        data-name="divider"
      />
      <AccessoryRow3 />
      <div
        className="bg-[#e0e0e0] h-px relative shrink-0 w-full"
        data-name="divider"
      />
      <AccessoryRow4 />
      <div
        className="bg-[#e0e0e0] h-px relative shrink-0 w-full"
        data-name="divider"
      />
      <AccessoryRow5 />
    </div>
  );
}

function Spacer() {
  return (
    <div
      className="flex-[1_0_0] h-px min-w-px opacity-0 relative"
      data-name="spacer"
    />
  );
}

function AccessoriesSubtotal() {
  return (
    <div
      className="content-stretch flex items-center justify-between pt-[4px] relative shrink-0 w-full"
      data-name="accessories-subtotal"
    >
      <Spacer />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap">
        Комплектуючі разом: ₴2,932
      </p>
    </div>
  );
}

function AccessoriesSection() {
  return (
    <div
      className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full"
      data-name="accessories-section"
    >
      <AccessoriesHeader />
      <AccessoriesList />
      <AccessoriesSubtotal />
    </div>
  );
}

function PriceBlock() {
  return (
    <div
      className="[word-break:break-word] content-stretch flex gap-[12px] items-baseline leading-[normal] relative shrink-0 whitespace-nowrap"
      data-name="price-block"
    >
      <p className="font-bold font-bold relative shrink-0 text-[#1a1a1a] text-[32px]">
        ₴ 8,782
      </p>
      <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-from-font decoration-solid font-normal font-normal line-through relative shrink-0 text-[#9e9e9e] text-[16px]">
        ₴ 7,200
      </p>
    </div>
  );
}

function Clock() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="clock">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="12"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
        width="12"
      >
        <g clipPath="url(#clip0_0_36)" id="clock">
          <path
            d={svgPaths.pd1f6ec0}
            id="Vector"
            stroke="#E53935"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_36">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconClock() {
  return (
    <div
      className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[12px]"
      data-name="Icon-clock"
    >
      <Clock />
    </div>
  );
}

function LeadTime() {
  return (
    <div
      className="bg-[#ffebee] content-stretch flex gap-[6px] items-center px-[10px] py-[4px] relative shrink-0"
      data-name="lead-time"
    >
      <IconClock />
      <p className="[word-break:break-word] font-semibold font-semibold leading-[normal] relative shrink-0 text-[#e53935] text-[12px] whitespace-nowrap">
        до 5 роб. днів
      </p>
    </div>
  );
}

function PriceRow() {
  return (
    <div
      className="content-stretch flex items-baseline justify-between relative shrink-0 w-full"
      data-name="price-row"
    >
      <PriceBlock />
      <LeadTime />
    </div>
  );
}

function AddToCartBtn() {
  return (
    <div
      className="bg-[#e53935] content-stretch flex flex-col items-center justify-center py-[16px] relative shrink-0 w-full"
      data-name="add-to-cart-btn"
    >
      <p className="[word-break:break-word] font-bold font-bold leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap">
        Додати в кошик
      </p>
    </div>
  );
}

function CheckoutBox() {
  return (
    <div
      className="bg-[#f7f7f7] relative shrink-0 w-full"
      data-name="checkout-box"
    >
      <div
        aria-hidden
        className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none"
      />
      <div className="content-stretch flex flex-col gap-[20px] items-start p-[20px] relative size-full">
        <PriceRow />
        <AddToCartBtn />
      </div>
    </div>
  );
}

function ConfiguratorAndCheckout() {
  return (
    <div
      className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-[520px]"
      data-name="configurator-and-checkout"
    >
      <StepCoating />
      <StepColor />
      <StepEdge />
      <StepSize />
      <AccessoriesSection />
      <CheckoutBox />
    </div>
  );
}

function SplitLayout() {
  return (
    <div
      className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full"
      data-name="split-layout"
    >
      <VisualPreview />
      <ConfiguratorAndCheckout />
    </div>
  );
}

function PageBodyContainer() {
  return (
    <div className="relative shrink-0 w-full" data-name="page-body-container">
      <div className="content-stretch flex flex-col gap-[24px] items-start pb-[64px] pt-[24px] px-[80px] relative size-full">
        <Breadcrumb />
        <TitleBlock />
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

function IconPhone1() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon-phone">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="14"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
        width="14"
      >
        <g clipPath="url(#clip0_0_8)" id="Icon-phone">
          <path
            d={svgPaths.p3981900}
            id="Vector"
            stroke="#E53935"
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

function PhoneRow() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full"
      data-name="phone-row"
    >
      <IconPhone1 />
      <p className="[word-break:break-word] font-medium font-medium leading-[normal] relative shrink-0 text-[13px] text-white whitespace-nowrap">
        +38 (097) 123-45-67
      </p>
    </div>
  );
}

function IconMapPin1() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon-map-pin">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="14"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
        width="14"
      >
        <g clipPath="url(#clip0_0_6)" id="Icon-map-pin">
          <path
            d={svgPaths.p2d61cd50}
            id="Vector"
            stroke="#E53935"
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

function AddressRow() {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full"
      data-name="address-row"
    >
      <IconMapPin1 />
      <p className="[word-break:break-word] font-light font-light leading-[normal] opacity-75 relative shrink-0 text-[13px] text-white whitespace-nowrap">
        м. Черкаси, вул. Смілянська, 120
      </p>
    </div>
  );
}

function IconFacebook() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon-facebook">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="14"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
        width="14"
      >
        <g clipPath="url(#clip0_0_30)" id="Icon-facebook">
          <path
            d={svgPaths.p1b7b00f0}
            id="Vector"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_30">
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
      <IconFacebook />
    </div>
  );
}

function IconInstagram() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon-instagram">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="14"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
        width="14"
      >
        <g clipPath="url(#clip0_0_42)" id="Icon-instagram">
          <path
            d={svgPaths.p2f26e800}
            id="Vector"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_42">
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
      <IconInstagram />
    </div>
  );
}

function IconTelegram() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon-telegram">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="14"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
        width="14"
      >
        <g clipPath="url(#clip0_0_4)" id="Icon-telegram">
          <path
            d={svgPaths.pb8eea80}
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
      <IconTelegram />
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
      className="[word-break:break-word] content-stretch flex font-light font-light items-center justify-between leading-[normal] relative shrink-0 text-[13px] text-white w-full whitespace-nowrap"
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

export default function DoorProductDesktop() {
  return (
    <div
      className="bg-white content-stretch flex flex-col items-start relative size-full"
      data-name="door-product-desktop"
    >
      <HeaderWrapper />
      <PageBodyContainer />
      <DesktopFooter />
    </div>
  );
}
