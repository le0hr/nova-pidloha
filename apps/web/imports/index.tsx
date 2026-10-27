import svgPaths from "./svg-qbaz9r9074";
import imgBrandIcon from "./87302d1f38e17f3e79cfa3ba4347f6dc47793a0a.png";
import imgPhotoFrame from "./12748a82b58a1ba0899af80c52b4ece5bd10a4a0.png";
import imgThumbImg from "./0d9a525e64ca6b9f92a18edab6ee2c3d3be3c44c.png";
import imgThumbImg1 from "./944f71941a96f8a26dac30ab8c55a1314652495d.png";
import imgThumbImg2 from "./5c37ef963b89a8928529b91315699306ae2e798e.png";
import imgThumbImg3 from "./aa89bf11e131485164d6a21b1d41f91b35eb3ff8.png";
import imgThumbImg4 from "./b121ec89f1e2fae837e2eab325a519b9d788cac6.png";
import imgThumbImg5 from "./b550088c96a2875076a99060369a55e6bd62aea4.png";

function Menu() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="menu">
      <svg className="absolute block inset-0 size-full" fill="none" height="22" preserveAspectRatio="none" viewBox="0 0 22 22" width="22">
        <g id="menu">
          <path d={svgPaths.pf6df440} id="Vector" stroke="#E53935" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function MenuBtn() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[44px]" data-name="menu-btn">
      <Menu />
    </div>
  );
}

function Slogan() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-name="slogan">
      <p className="font-['Outfit:Bold','Noto_Sans:Bold',sans-serif] font-bold relative shrink-0 text-[#1a1a1a] text-[16px]">НОВА ПІДЛОГА</p>
      <p className="font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#e53935] text-[10px] uppercase">ТА ДВЕРІ</p>
    </div>
  );
}

function Logo() {
  return (
    <div className="content-stretch flex gap-[7px] items-center justify-center relative shrink-0" data-name="logo">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[38px]" data-name="brand-icon">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgBrandIcon} />
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
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <g id="shopping-bag">
          <path d={svgPaths.p23bcc680} id="Vector" stroke="#1A1A1A" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function CartCount() {
  return (
    <div className="absolute bg-[#e53935] content-stretch flex items-start px-[6px] py-[2px] right-[-2px] top-[-2px]" data-name="CartCount">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[10px] text-white whitespace-nowrap">3</p>
    </div>
  );
}

function CartIcon() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[40px]" data-name="CartIcon">
      <ShoppingBag />
      <CartCount />
    </div>
  );
}

function MobileHeader() {
  return (
    <div className="bg-white h-[74px] relative shrink-0 w-full" data-name="mobile-header">
      <div aria-hidden className="absolute border-[#e0e0e0] border-b border-solid inset-0 pointer-events-none" />
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
    <div className="bg-[#f7f7f7] relative shrink-0 w-full" data-name="breadcrumb">
      <div className="content-stretch flex items-start px-[16px] py-[12px] relative size-full">
        <p className="[word-break:break-word] font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#9e9e9e] text-[12px] whitespace-nowrap">{`Головна > Каталог дверей > Porto CPL 1.1`}</p>
      </div>
    </div>
  );
}

function TitleBlock() {
  return (
    <div className="relative shrink-0 w-full" data-name="title-block">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[normal] pb-[8px] pt-[16px] px-[16px] relative size-full whitespace-nowrap">
        <p className="font-['Outfit:Bold',sans-serif] font-bold relative shrink-0 text-[#1a1a1a] text-[24px]">Porto CPL 1.1</p>
        <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#9e9e9e] text-[13px]">Міжкімнатні двері / МДФ</p>
      </div>
    </div>
  );
}

function ZoomIn() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="zoom-in">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="zoom-in">
          <path d={svgPaths.p392f6e00} id="Vector" stroke="#1A1A1A" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconSearchPlus() {
  return (
    <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[18px]" data-name="Icon-search-plus">
      <ZoomIn />
    </div>
  );
}

function ZoomBtn() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.8)] content-stretch flex items-center justify-center p-[10px] right-[16px] top-[16px]" data-name="zoom-btn">
      <IconSearchPlus />
    </div>
  );
}

function EdgeBadge() {
  return (
    <div className="absolute bg-[#1a1a1a] content-stretch flex gap-[6px] items-center left-[16px] px-[12px] py-[6px] top-[16px]" data-name="edge-badge">
      <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" height="8" preserveAspectRatio="none" viewBox="0 0 8 8" width="8">
          <circle cx="4" cy="4" fill="white" id="Ellipse" r="4" />
        </svg>
      </div>
      <p className="[word-break:break-word] font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[12px] text-white whitespace-nowrap">Чорна матова кромка</p>
    </div>
  );
}

function ChevronLeft() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="chevron-left">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="chevron-left">
          <path d="M11.25 13.5L6.75 9L11.25 4.5" id="Vector" stroke="#1A1A1A" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function NavPrev() {
  return (
    <div className="-translate-y-1/2 absolute bg-white left-[16px] size-[44px] top-[calc(50%+4px)]" data-name="nav-prev">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[inherit] size-full">
        <ChevronLeft />
      </div>
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="chevron-right">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="chevron-right">
          <path d="M6.75 13.5L11.25 9L6.75 4.5" id="Vector" stroke="#1A1A1A" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function NavNext() {
  return (
    <div className="-translate-y-1/2 absolute bg-white right-[8px] size-[44px] top-[calc(50%+4px)]" data-name="nav-next">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[inherit] size-full">
        <ChevronRight />
      </div>
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function PhotoFrame() {
  return (
    <div className="h-[600px] relative shrink-0 w-full" data-name="photo-frame">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgPhotoFrame} />
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <ZoomBtn />
        <EdgeBadge />
        <NavPrev />
        <NavNext />
      </div>
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function ThumbDubSonoma() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[48px]" data-name="thumb-dub-sonoma">
      <div className="h-[64px] pointer-events-none relative shrink-0 w-[48px]" data-name="thumb-img">
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgThumbImg} />
        <div aria-hidden className="absolute border-2 border-[#e53935] border-solid inset-0" />
      </div>
    </div>
  );
}

function ThumbVenge() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[48px]" data-name="thumb-venge">
      <div className="h-[64px] pointer-events-none relative shrink-0 w-[48px]" data-name="thumb-img">
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgThumbImg1} />
        <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0" />
      </div>
    </div>
  );
}

function ThumbBilyiYasen() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[48px]" data-name="thumb-bilyi-yasen">
      <div className="h-[64px] pointer-events-none relative shrink-0 w-[48px]" data-name="thumb-img">
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgThumbImg2} />
        <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0" />
      </div>
    </div>
  );
}

function ThumbGorikh() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[48px]" data-name="thumb-gorikh">
      <div className="h-[64px] pointer-events-none relative shrink-0 w-[48px]" data-name="thumb-img">
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgThumbImg3} />
        <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0" />
      </div>
    </div>
  );
}

function ThumbVilka() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[48px]" data-name="thumb-vilka">
      <div className="h-[64px] pointer-events-none relative shrink-0 w-[48px]" data-name="thumb-img">
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgThumbImg4} />
        <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0" />
      </div>
    </div>
  );
}

function ThumbSiroyDub() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[48px]" data-name="thumb-siroy-dub">
      <div className="h-[64px] pointer-events-none relative shrink-0 w-[48px]" data-name="thumb-img">
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgThumbImg5} />
        <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0" />
      </div>
    </div>
  );
}

function ThumbnailRow() {
  return (
    <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-name="thumbnail-row">
      <ThumbDubSonoma />
      <ThumbVenge />
      <ThumbBilyiYasen />
      <ThumbGorikh />
      <ThumbVilka />
      <ThumbSiroyDub />
    </div>
  );
}

function DotIndicators() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0 w-full" data-name="dot-indicators">
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
          <circle cx="3" cy="3" fill="#E53935" id="Ellipse" r="3" />
        </svg>
      </div>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
          <circle cx="3" cy="3" fill="#E0E0E0" id="Ellipse" r="3" />
        </svg>
      </div>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
          <circle cx="3" cy="3" fill="#E0E0E0" id="Ellipse" r="3" />
        </svg>
      </div>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
          <circle cx="3" cy="3" fill="#E0E0E0" id="Ellipse" r="3" />
        </svg>
      </div>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
          <circle cx="3" cy="3" fill="#E0E0E0" id="Ellipse" r="3" />
        </svg>
      </div>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
          <circle cx="3" cy="3" fill="#E0E0E0" id="Ellipse" r="3" />
        </svg>
      </div>
    </div>
  );
}

function ImageGallery() {
  return (
    <div className="relative shrink-0 w-full" data-name="image-gallery">
      <div className="content-stretch flex flex-col gap-[12px] items-start pb-[16px] px-[16px] relative size-full">
        <PhotoFrame />
        <ThumbnailRow />
        <DotIndicators />
      </div>
    </div>
  );
}

function StepHeader() {
  return (
    <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] relative shrink-0 w-full whitespace-nowrap" data-name="step-header">
      <p className="font-['Outfit:Bold','Noto_Sans:Bold',sans-serif] font-bold relative shrink-0 text-[#1a1a1a] text-[14px]">Крок 1: Тип покриття</p>
      <p className="font-['Outfit:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#9e9e9e] text-[12px]">1/4</p>
    </div>
  );
}

function SegSincrolam() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] h-[44px] items-center justify-center min-w-px relative" data-name="seg-sincrolam">
      <div aria-hidden className="absolute border-2 border-[#e53935] border-solid inset-0 pointer-events-none" />
      <p className="[word-break:break-word] font-['Outfit:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[12px] whitespace-nowrap">Sincrolam®</p>
    </div>
  );
}

function SegPp() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] h-[44px] items-center justify-center min-w-px relative" data-name="seg-pp">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <p className="[word-break:break-word] font-['Outfit:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[12px] whitespace-nowrap">PP</p>
    </div>
  );
}

function SegSuperPet() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] h-[44px] items-center justify-center min-w-px relative" data-name="seg-super-pet">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <p className="[word-break:break-word] font-['Outfit:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[12px] whitespace-nowrap">Super PET</p>
    </div>
  );
}

function CoatingSegments() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="coating-segments">
      <SegSincrolam />
      <SegPp />
      <SegSuperPet />
    </div>
  );
}

function StepCoating() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="step-coating">
      <StepHeader />
      <CoatingSegments />
    </div>
  );
}

function StepHeader1() {
  return (
    <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] relative shrink-0 w-full whitespace-nowrap" data-name="step-header">
      <p className="font-['Outfit:Bold','Noto_Sans:Bold',sans-serif] font-bold relative shrink-0 text-[#1a1a1a] text-[14px]">Крок 2: Колір</p>
      <p className="font-['Outfit:Medium','Noto_Sans:Medium',sans-serif] font-medium relative shrink-0 text-[#9e9e9e] text-[11px]">(не впливає на ціну)</p>
    </div>
  );
}

function SwatchDubSonoma() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-center min-w-px relative" data-name="swatch-dub-sonoma">
      <div className="h-[64px] pointer-events-none relative shrink-0 w-full" data-name="swatch-img">
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgThumbImg} />
        <div aria-hidden className="absolute border-2 border-[#e53935] border-solid inset-0" />
      </div>
      <p className="[word-break:break-word] font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[10px] text-center text-ellipsis whitespace-nowrap">Дуб Сонома</p>
    </div>
  );
}

function SwatchVenge() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-center min-w-px relative" data-name="swatch-venge">
      <div className="h-[64px] pointer-events-none relative shrink-0 w-full" data-name="swatch-img">
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgThumbImg1} />
        <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0" />
      </div>
      <p className="[word-break:break-word] font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[10px] text-center text-ellipsis whitespace-nowrap">Венге</p>
    </div>
  );
}

function SwatchBilyiYasen() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-center min-w-px relative" data-name="swatch-bilyi-yasen">
      <div className="h-[64px] pointer-events-none relative shrink-0 w-full" data-name="swatch-img">
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgThumbImg2} />
        <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0" />
      </div>
      <p className="[word-break:break-word] font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[10px] text-center text-ellipsis whitespace-nowrap">Білий ясен</p>
    </div>
  );
}

function SwatchGorikh() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-center min-w-px relative" data-name="swatch-gorikh">
      <div className="h-[64px] pointer-events-none relative shrink-0 w-full" data-name="swatch-img">
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgThumbImg3} />
        <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0" />
      </div>
      <p className="[word-break:break-word] font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[10px] text-center text-ellipsis whitespace-nowrap">Горіх</p>
    </div>
  );
}

function Row() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="row-1">
      <SwatchDubSonoma />
      <SwatchVenge />
      <SwatchBilyiYasen />
      <SwatchGorikh />
    </div>
  );
}

function SwatchVilka() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-center min-w-px relative" data-name="swatch-vilka">
      <div className="h-[64px] pointer-events-none relative shrink-0 w-full" data-name="swatch-img">
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgThumbImg4} />
        <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0" />
      </div>
      <p className="[word-break:break-word] font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[10px] text-center text-ellipsis whitespace-nowrap">Вільха</p>
    </div>
  );
}

function SwatchSiroyDub() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-center min-w-px relative" data-name="swatch-siroy-dub">
      <div className="h-[64px] pointer-events-none relative shrink-0 w-full" data-name="swatch-img">
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgThumbImg5} />
        <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0" />
      </div>
      <p className="[word-break:break-word] font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[10px] text-center text-ellipsis whitespace-nowrap">Сірий дуб</p>
    </div>
  );
}

function SwatchSpacer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-center min-w-px opacity-0 relative" data-name="swatch-spacer-1">
      <div className="bg-white h-[64px] relative shrink-0 w-full" data-name="swatch-img">
        <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      </div>
      <p className="[word-break:break-word] font-['Outfit:Regular',sans-serif] font-normal leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[10px] text-center text-ellipsis whitespace-nowrap">-</p>
    </div>
  );
}

function SwatchSpacer1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-center min-w-px opacity-0 relative" data-name="swatch-spacer-2">
      <div className="bg-white h-[64px] relative shrink-0 w-full" data-name="swatch-img">
        <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      </div>
      <p className="[word-break:break-word] font-['Outfit:Regular',sans-serif] font-normal leading-[normal] overflow-hidden relative shrink-0 text-[#1a1a1a] text-[10px] text-center text-ellipsis whitespace-nowrap">-</p>
    </div>
  );
}

function Row1() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="row-2">
      <SwatchVilka />
      <SwatchSiroyDub />
      <SwatchSpacer />
      <SwatchSpacer1 />
    </div>
  );
}

function ColorGrid() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="color-grid">
      <Row />
      <Row1 />
    </div>
  );
}

function StepColor() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="step-color">
      <StepHeader1 />
      <ColorGrid />
    </div>
  );
}

function StepHeader2() {
  return (
    <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] relative shrink-0 w-full whitespace-nowrap" data-name="step-header">
      <p className="font-['Outfit:Bold','Noto_Sans:Bold',sans-serif] font-bold relative shrink-0 text-[#1a1a1a] text-[14px]">Крок 3: Кромка</p>
      <p className="font-['Outfit:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#9e9e9e] text-[12px]">3/4</p>
    </div>
  );
}

function Left() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="left">
      <div className="bg-[#9e9e9e] h-[16px] relative shrink-0 w-[4px]" data-name="Rectangle" />
      <p className="[word-break:break-word] font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">Звичайна</p>
    </div>
  );
}

function PillOrdinary() {
  return (
    <div className="bg-white h-[48px] relative shrink-0 w-full" data-name="pill-ordinary">
      <div aria-hidden className="absolute border-2 border-[#e53935] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] relative size-full">
          <Left />
          <p className="[word-break:break-word] font-['Outfit:Bold','Noto_Sans:Bold','Noto_Sans_Math:Regular','Noto_Sans_Symbols:Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">+₴0</p>
        </div>
      </div>
    </div>
  );
}

function Left1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="left">
      <div className="bg-[#1a1a1a] h-[16px] relative shrink-0 w-[4px]" data-name="Rectangle" />
      <p className="[word-break:break-word] font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">Чорна матова</p>
    </div>
  );
}

function PillMatteBlack() {
  return (
    <div className="bg-white h-[48px] relative shrink-0 w-full" data-name="pill-matte-black">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] relative size-full">
          <Left1 />
          <p className="[word-break:break-word] font-['Outfit:Bold','Noto_Sans:Bold','Noto_Sans_Math:Regular','Noto_Sans_Symbols:Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">+₴165</p>
        </div>
      </div>
    </div>
  );
}

function Left2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="left">
      <div className="bg-[#bdc3c7] h-[16px] relative shrink-0 w-[4px]" data-name="Rectangle" />
      <p className="[word-break:break-word] font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">Алюмінієва</p>
    </div>
  );
}

function Info() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="info">
      <svg className="absolute block inset-0 size-full" fill="none" height="12" preserveAspectRatio="none" viewBox="0 0 12 12" width="12">
        <g clipPath="url(#clip0_0_32)" id="info">
          <path d={svgPaths.p21831200} id="Vector" stroke="#9E9E9E" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_32">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconInfo() {
  return (
    <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[12px]" data-name="Icon-info">
      <Info />
    </div>
  );
}

function Right() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="right">
      <p className="[word-break:break-word] font-['Outfit:Bold','Noto_Sans:Bold','Noto_Sans_Math:Regular','Noto_Sans_Symbols:Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">+₴500</p>
      <IconInfo />
    </div>
  );
}

function PillAluminum() {
  return (
    <div className="bg-white h-[48px] opacity-40 relative shrink-0 w-full" data-name="pill-aluminum">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] relative size-full">
          <Left2 />
          <Right />
        </div>
      </div>
    </div>
  );
}

function EdgePills() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="edge-pills">
      <PillOrdinary />
      <PillMatteBlack />
      <PillAluminum />
    </div>
  );
}

function StepEdge() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="step-edge">
      <StepHeader2 />
      <EdgePills />
    </div>
  );
}

function SizeHeader() {
  return (
    <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] relative shrink-0 w-full whitespace-nowrap" data-name="size-header">
      <p className="font-['Outfit:Bold','Noto_Sans:Bold',sans-serif] font-bold relative shrink-0 text-[#1a1a1a] text-[14px]">Крок 4: Розмір</p>
      <p className="font-['Outfit:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#9e9e9e] text-[12px]">4/4</p>
    </div>
  );
}

function OptStandard() {
  return (
    <div className="content-stretch flex items-start px-[10px] py-[3px] relative shrink-0" data-name="opt-standard">
      <p className="[word-break:break-word] font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#9e9e9e] text-[11px] whitespace-nowrap">Стандарт</p>
    </div>
  );
}

function OptCustom() {
  return (
    <div className="bg-white content-stretch flex items-start px-[10px] py-[3px] relative shrink-0" data-name="opt-custom">
      <p className="[word-break:break-word] font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[11px] whitespace-nowrap">Нестандарт</p>
    </div>
  );
}

function ToggleTrack() {
  return (
    <div className="bg-[#f7f7f7] content-stretch flex gap-[2px] items-center p-[2px] relative shrink-0" data-name="toggle-track">
      <OptStandard />
      <OptCustom />
    </div>
  );
}

function InputField() {
  return (
    <div className="relative shrink-0 w-full" data-name="input-field">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex items-start px-[12px] py-[8px] relative size-full">
        <p className="[word-break:break-word] font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">750</p>
      </div>
    </div>
  );
}

function InputWidth() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative" data-name="input-width">
      <p className="[word-break:break-word] font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#9e9e9e] text-[11px] whitespace-nowrap">Ширина, мм</p>
      <InputField />
    </div>
  );
}

function InputField1() {
  return (
    <div className="relative shrink-0 w-full" data-name="input-field">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex items-start px-[12px] py-[8px] relative size-full">
        <p className="[word-break:break-word] font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">2050</p>
      </div>
    </div>
  );
}

function InputHeight() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative" data-name="input-height">
      <p className="[word-break:break-word] font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#9e9e9e] text-[11px] whitespace-nowrap">Висота, мм</p>
      <InputField1 />
    </div>
  );
}

function SizeInputs() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="size-inputs">
      <InputWidth />
      <InputHeight />
    </div>
  );
}

function AlertCircle() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="alert-circle">
      <svg className="absolute block inset-0 size-full" fill="none" height="14" preserveAspectRatio="none" viewBox="0 0 14 14" width="14">
        <g clipPath="url(#clip0_0_30)" id="alert-circle">
          <path d={svgPaths.p3aceeb00} id="Vector" stroke="#E67E22" strokeLinecap="round" strokeWidth="2" />
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

function IconExclamation() {
  return (
    <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[14px]" data-name="Icon-exclamation">
      <AlertCircle />
    </div>
  );
}

function WarningBanner() {
  return (
    <div className="bg-[#fef5ed] relative shrink-0 w-full" data-name="warning-banner">
      <div aria-hidden className="absolute border-[#e67e22] border-l-4 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center p-[10px] relative size-full">
          <IconExclamation />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Outfit:Medium','Noto_Sans:Medium',sans-serif] font-medium leading-[normal] min-w-px relative text-[#e67e22] text-[12px]">⚠ Нестандартний розмір: націнка +15-20%</p>
        </div>
      </div>
    </div>
  );
}

function StepSize() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="step-size">
      <SizeHeader />
      <ToggleTrack />
      <SizeInputs />
      <WarningBanner />
    </div>
  );
}

function AccessoriesHeader() {
  return (
    <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] relative shrink-0 w-full whitespace-nowrap" data-name="accessories-header">
      <p className="font-['Outfit:Bold','Noto_Sans:Bold',sans-serif] font-bold relative shrink-0 text-[#1a1a1a] text-[14px]">Комплектуючі</p>
      <p className="font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#9e9e9e] text-[11px]">(додатково)</p>
    </div>
  );
}

function Package() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="package">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="package">
          <path d={svgPaths.p2cab6600} id="Vector" stroke="#9E9E9E" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon() {
  return (
    <div className="bg-[#f7f7f7] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[40px]" data-name="icon">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <Package />
    </div>
  );
}

function NameSpec() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative" data-name="name-spec">
      <p className="font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#1a1a1a] text-[13px] w-full">Коробка МДФ Телескоп</p>
      <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#9e9e9e] text-[11px] w-full">90×38, з ущільнювачем</p>
    </div>
  );
}

function BtnMinus() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[20px]" data-name="btn-minus">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <p className="[word-break:break-word] font-['Outfit:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap">−</p>
    </div>
  );
}

function BtnPlus() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[20px]" data-name="btn-plus">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <p className="[word-break:break-word] font-['Outfit:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap">+</p>
    </div>
  );
}

function QtyStepper() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] items-center px-[8px] py-[4px] relative shrink-0" data-name="qty-stepper">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <BtnMinus />
      <p className="[word-break:break-word] font-['Outfit:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">1</p>
      <BtnPlus />
    </div>
  );
}

function PriceControl() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-end relative shrink-0" data-name="price-control">
      <p className="[word-break:break-word] font-['Outfit:Bold','Noto_Sans:Bold','Noto_Sans_Math:Regular','Noto_Sans_Symbols:Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">₴1,020</p>
      <QtyStepper />
    </div>
  );
}

function AccessoryRow() {
  return (
    <div className="content-stretch flex gap-[12px] items-center py-[10px] relative shrink-0 w-full" data-name="accessory-row">
      <Icon />
      <NameSpec />
      <PriceControl />
    </div>
  );
}

function Divider() {
  return <div className="bg-[#e0e0e0] h-px relative shrink-0 w-full" data-name="divider" />;
}

function Package1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="package">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="package">
          <path d={svgPaths.p2cab6600} id="Vector" stroke="#9E9E9E" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="bg-[#f7f7f7] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[40px]" data-name="icon">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <Package1 />
    </div>
  );
}

function NameSpec1() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative" data-name="name-spec">
      <p className="font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#1a1a1a] text-[13px] w-full">Лиштва плоска МДФ</p>
      <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#9e9e9e] text-[11px] w-full">70×10, телескоп</p>
    </div>
  );
}

function BtnMinus1() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[20px]" data-name="btn-minus">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <p className="[word-break:break-word] font-['Outfit:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap">−</p>
    </div>
  );
}

function BtnPlus1() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[20px]" data-name="btn-plus">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <p className="[word-break:break-word] font-['Outfit:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap">+</p>
    </div>
  );
}

function QtyStepper1() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] items-center px-[8px] py-[4px] relative shrink-0" data-name="qty-stepper">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <BtnMinus1 />
      <p className="[word-break:break-word] font-['Outfit:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">2</p>
      <BtnPlus1 />
    </div>
  );
}

function PriceControl1() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-end relative shrink-0" data-name="price-control">
      <p className="[word-break:break-word] font-['Outfit:Bold','Noto_Sans:Bold','Noto_Sans_Math:Regular','Noto_Sans_Symbols:Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">₴446</p>
      <QtyStepper1 />
    </div>
  );
}

function AccessoryRow1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center py-[10px] relative shrink-0 w-full" data-name="accessory-row">
      <Icon1 />
      <NameSpec1 />
      <PriceControl1 />
    </div>
  );
}

function Divider1() {
  return <div className="bg-[#e0e0e0] h-px relative shrink-0 w-full" data-name="divider" />;
}

function Package2() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="package">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="package">
          <path d={svgPaths.p2cab6600} id="Vector" stroke="#9E9E9E" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon2() {
  return (
    <div className="bg-[#f7f7f7] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[40px]" data-name="icon">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <Package2 />
    </div>
  );
}

function NameSpec2() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative" data-name="name-spec">
      <p className="font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#1a1a1a] text-[13px] w-full">Доборна планка</p>
      <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#9e9e9e] text-[11px] w-full">100 мм</p>
    </div>
  );
}

function BtnMinus2() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[20px]" data-name="btn-minus">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <p className="[word-break:break-word] font-['Outfit:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap">−</p>
    </div>
  );
}

function BtnPlus2() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[20px]" data-name="btn-plus">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <p className="[word-break:break-word] font-['Outfit:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap">+</p>
    </div>
  );
}

function QtyStepper2() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] items-center px-[8px] py-[4px] relative shrink-0" data-name="qty-stepper">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <BtnMinus2 />
      <p className="[word-break:break-word] font-['Outfit:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">0</p>
      <BtnPlus2 />
    </div>
  );
}

function PriceControl2() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-end relative shrink-0" data-name="price-control">
      <p className="[word-break:break-word] font-['Outfit:Bold','Noto_Sans:Bold','Noto_Sans_Math:Regular','Noto_Sans_Symbols:Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">₴320</p>
      <QtyStepper2 />
    </div>
  );
}

function AccessoryRow2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center py-[10px] relative shrink-0 w-full" data-name="accessory-row">
      <Icon2 />
      <NameSpec2 />
      <PriceControl2 />
    </div>
  );
}

function Divider2() {
  return <div className="bg-[#e0e0e0] h-px relative shrink-0 w-full" data-name="divider" />;
}

function Package3() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="package">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="package">
          <path d={svgPaths.p2cab6600} id="Vector" stroke="#9E9E9E" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon3() {
  return (
    <div className="bg-[#f7f7f7] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[40px]" data-name="icon">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <Package3 />
    </div>
  );
}

function NameSpec3() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative" data-name="name-spec">
      <p className="font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#1a1a1a] text-[13px] w-full">Ручка дверна</p>
      <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#9e9e9e] text-[11px] w-full">Хром матовий</p>
    </div>
  );
}

function Check() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="check">
      <svg className="absolute block inset-0 size-full" fill="none" height="14" preserveAspectRatio="none" viewBox="0 0 14 14" width="14">
        <g id="check">
          <path d={svgPaths.p27200700} id="Vector" stroke="white" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function CheckboxChecked() {
  return (
    <div className="bg-[#e53935] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[18px]" data-name="checkbox-checked">
      <div aria-hidden className="absolute border border-[#e53935] border-solid inset-0 pointer-events-none" />
      <Check />
    </div>
  );
}

function PriceControl3() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-end relative shrink-0" data-name="price-control">
      <p className="[word-break:break-word] font-['Outfit:Bold','Noto_Sans:Bold','Noto_Sans_Math:Regular','Noto_Sans_Symbols:Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">₴580</p>
      <CheckboxChecked />
    </div>
  );
}

function AccessoryRow3() {
  return (
    <div className="content-stretch flex gap-[12px] items-center py-[10px] relative shrink-0 w-full" data-name="accessory-row">
      <Icon3 />
      <NameSpec3 />
      <PriceControl3 />
    </div>
  );
}

function Divider3() {
  return <div className="bg-[#e0e0e0] h-px relative shrink-0 w-full" data-name="divider" />;
}

function Package4() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="package">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="package">
          <path d={svgPaths.p2cab6600} id="Vector" stroke="#9E9E9E" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon4() {
  return (
    <div className="bg-[#f7f7f7] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[40px]" data-name="icon">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <Package4 />
    </div>
  );
}

function NameSpec4() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative" data-name="name-spec">
      <p className="font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#1a1a1a] text-[13px] w-full">Петлі приховані</p>
      <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#9e9e9e] text-[11px] w-full">Комплект 2 шт.</p>
    </div>
  );
}

function Checkbox() {
  return (
    <div className="bg-white relative shrink-0 size-[18px]" data-name="checkbox">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function PriceControl4() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-end relative shrink-0" data-name="price-control">
      <p className="[word-break:break-word] font-['Outfit:Bold','Noto_Sans:Bold','Noto_Sans_Math:Regular','Noto_Sans_Symbols:Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">₴850</p>
      <Checkbox />
    </div>
  );
}

function AccessoryRow4() {
  return (
    <div className="content-stretch flex gap-[12px] items-center py-[10px] relative shrink-0 w-full" data-name="accessory-row">
      <Icon4 />
      <NameSpec4 />
      <PriceControl4 />
    </div>
  );
}

function Divider4() {
  return <div className="bg-[#e0e0e0] h-px relative shrink-0 w-full" data-name="divider" />;
}

function Package5() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="package">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="package">
          <path d={svgPaths.p2cab6600} id="Vector" stroke="#9E9E9E" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon5() {
  return (
    <div className="bg-[#f7f7f7] content-stretch flex flex-col items-center justify-center relative shrink-0 size-[40px]" data-name="icon">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
      <Package5 />
    </div>
  );
}

function NameSpec5() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative" data-name="name-spec">
      <p className="font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#1a1a1a] text-[13px] w-full">Замок магнітний</p>
      <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#9e9e9e] text-[11px] w-full">Тихий хід</p>
    </div>
  );
}

function Checkbox1() {
  return (
    <div className="bg-white relative shrink-0 size-[18px]" data-name="checkbox">
      <div aria-hidden className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function PriceControl5() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-end relative shrink-0" data-name="price-control">
      <p className="[word-break:break-word] font-['Outfit:Bold','Noto_Sans:Bold','Noto_Sans_Math:Regular','Noto_Sans_Symbols:Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">₴720</p>
      <Checkbox1 />
    </div>
  );
}

function AccessoryRow5() {
  return (
    <div className="content-stretch flex gap-[12px] items-center py-[10px] relative shrink-0 w-full" data-name="accessory-row">
      <Icon5 />
      <NameSpec5 />
      <PriceControl5 />
    </div>
  );
}

function AccessoriesList() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="accessories-list">
      <AccessoryRow />
      <Divider />
      <AccessoryRow1 />
      <Divider1 />
      <AccessoryRow2 />
      <Divider2 />
      <AccessoryRow3 />
      <Divider3 />
      <AccessoryRow4 />
      <Divider4 />
      <AccessoryRow5 />
    </div>
  );
}

function Frame() {
  return <div className="flex-[1_0_0] h-px min-w-px opacity-0 relative" data-name="Frame" />;
}

function AccessoriesSubtotal() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="accessories-subtotal">
      <Frame />
      <p className="[word-break:break-word] font-['Outfit:Bold','Noto_Sans:Bold','Noto_Sans_Math:Regular','Noto_Sans_Symbols:Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap">Комплектуючі: ₴2,932</p>
    </div>
  );
}

function AccessoriesSection() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="accessories-section">
      <AccessoriesHeader />
      <AccessoriesList />
      <AccessoriesSubtotal />
    </div>
  );
}

function ConfiguratorControls() {
  return (
    <div className="relative shrink-0 w-full" data-name="configurator-controls">
      <div className="content-stretch flex flex-col gap-[28px] items-start pb-[24px] pt-[8px] px-[16px] relative size-full">
        <StepCoating />
        <StepColor />
        <StepEdge />
        <StepSize />
        <AccessoriesSection />
      </div>
    </div>
  );
}

function PriceGroup() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[8px] items-baseline leading-[normal] relative shrink-0 whitespace-nowrap" data-name="price-group">
      <p className="font-['Outfit:Bold','Noto_Sans:Bold','Noto_Sans_Math:Regular','Noto_Sans_Symbols:Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-bold relative shrink-0 text-[#1a1a1a] text-[24px]">₴ 8,782</p>
      <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-from-font decoration-solid font-['Outfit:Regular','Noto_Sans:Regular','Noto_Sans_Math:Regular','Noto_Sans_Symbols:Regular','Noto_Sans_Symbols2:Regular',sans-serif] font-normal line-through relative shrink-0 text-[#9e9e9e] text-[14px]">₴ 7,200</p>
    </div>
  );
}

function Clock() {
  return (
    <div className="relative shrink-0 size-[10px]" data-name="clock">
      <svg className="absolute block inset-0 size-full" fill="none" height="10" preserveAspectRatio="none" viewBox="0 0 10 10" width="10">
        <g clipPath="url(#clip0_0_8)" id="clock">
          <path d={svgPaths.p25cbcd00} id="Vector" stroke="#E53935" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_8">
            <rect fill="white" height="10" width="10" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconClock() {
  return (
    <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[10px]" data-name="Icon-clock">
      <Clock />
    </div>
  );
}

function LeadTime() {
  return (
    <div className="bg-[#ffebee] content-stretch flex gap-[4px] items-center px-[8px] py-[3px] relative shrink-0" data-name="lead-time">
      <IconClock />
      <p className="[word-break:break-word] font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#e53935] text-[11px] whitespace-nowrap">до 5 роб. днів</p>
    </div>
  );
}

function PriceLine() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="price-line">
      <PriceGroup />
      <LeadTime />
    </div>
  );
}

function AddToCartBtn() {
  return (
    <div className="bg-[#e53935] content-stretch flex flex-col items-center justify-center py-[12px] relative shrink-0 w-full" data-name="add-to-cart-btn">
      <p className="[word-break:break-word] font-['Outfit:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[15px] text-white whitespace-nowrap">Додати в кошик</p>
    </div>
  );
}

function MobileCheckoutBar() {
  return (
    <div className="bg-[#f7f7f7] relative shrink-0 w-full" data-name="mobile-checkout-bar">
      <div aria-hidden className="absolute border-[#e0e0e0] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[12px] items-start p-[16px] relative size-full">
        <PriceLine />
        <AddToCartBtn />
      </div>
    </div>
  );
}

function Slogan1() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-name="slogan">
      <p className="font-['Outfit:SemiBold','Noto_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[16px] text-white">НОВА ПІДЛОГА</p>
      <p className="font-['Outfit:Medium','Noto_Sans:Medium',sans-serif] font-medium relative shrink-0 text-[#e53935] text-[11px]">ТА ДВЕРІ</p>
    </div>
  );
}

function FooterLogo() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="footer-logo">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[38px]" data-name="brand-icon">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgBrandIcon} />
          </div>
        </div>
      </div>
      <Slogan1 />
    </div>
  );
}

function PhoneIcon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="phone-icon">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g clipPath="url(#clip0_0_14)" id="phone-icon">
          <path d={svgPaths.p29098400} id="Vector" stroke="#E53935" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_14">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Phone() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="phone">
      <PhoneIcon />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Outfit:Medium',sans-serif] font-medium leading-[normal] min-w-px relative text-[13px] text-white">+38 (097) 123-45-67</p>
    </div>
  );
}

function MapPin() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="map-pin">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="map-pin">
          <path d={svgPaths.p3ca31280} id="Vector" stroke="#E53935" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Address() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="address">
      <MapPin />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Outfit:Light','Noto_Sans:Light',sans-serif] font-light leading-[normal] min-w-px opacity-75 relative text-[13px] text-white">Черкаси, Україна</p>
    </div>
  );
}

function FooterContact() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="footer-contact">
      <Phone />
      <Address />
    </div>
  );
}

function Facebook() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="facebook">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="facebook">
          <path d={svgPaths.p304d6600} id="Vector" stroke="white" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Instagram() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="instagram">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g clipPath="url(#clip0_0_18)" id="instagram">
          <path d={svgPaths.p1a239e00} id="Vector" stroke="white" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_18">
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
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g clipPath="url(#clip0_0_4)" id="message-circle">
          <path d={svgPaths.pea36900} id="Vector" stroke="white" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_4">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function FooterSocials() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="footer-socials">
      <Facebook />
      <Instagram />
      <MessageCircle />
    </div>
  );
}

function FooterBrand() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="footer-brand">
      <FooterLogo />
      <p className="[word-break:break-word] font-['Outfit:Light','Noto_Sans:Light',sans-serif] font-light leading-[1.5] min-w-full opacity-75 relative shrink-0 text-[13px] text-white w-[min-content]">Широкий асортимент сертифікованого підлогового покриття та міжкімнатних дверей в наявності та під замовлення у Черкасах.</p>
      <FooterContact />
      <FooterSocials />
    </div>
  );
}

function FooterDivider() {
  return <div className="bg-white h-px opacity-12 relative shrink-0 w-full" data-name="footer-divider" />;
}

function Footer() {
  return (
    <div className="bg-[#1a1a1a] relative shrink-0 w-full" data-name="footer">
      <div className="content-stretch flex flex-col gap-[16px] items-start px-[16px] py-[24px] relative size-full">
        <FooterBrand />
        <FooterDivider />
        <p className="[word-break:break-word] font-['Outfit:Light','Noto_Sans:Light',sans-serif] font-light leading-[normal] opacity-60 relative shrink-0 text-[12px] text-white w-full">© 2025 Нова підлога та Двері. Всі права захищені.</p>
      </div>
    </div>
  );
}

export default function DoorProductMobile() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="door-product-mobile">
      <MobileHeader />
      <Breadcrumb />
      <TitleBlock />
      <ImageGallery />
      <ConfiguratorControls />
      <MobileCheckoutBar />
      <Footer />
    </div>
  );
}