import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import HomeMotion from "@/components/home/HomeMotion";
import HomeIcon from "@/components/home/HomeIcon";
import Stores from "@/components/home/Stores";
import JsonLd from "@/components/seo/JsonLd";
import { getAboutPage } from "@/lib/services/about.service";
import { getShopLocations } from "@/lib/services/shop.service";
import { cmsStructuredData, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage();
  return pageMetadata({
    title: "Про нас",
    description: "Підлога та двері для вашого дому. Знайомтеся з нашим підходом та завітайте до виставкових залів Нова Підлога у Черкасах.",
    path: "/about",
  }, page.seo);
}

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e53935]";
const eyebrow = "text-xs font-bold uppercase tracking-[0.16em] text-[#e53935]";
const external = (url: string) => /^https?:\/\//.test(url);

/** CMS title: a new line is a line break, *word* is the red accent. */
function Rich({ text, accent = "text-[#e53935]" }: { text: string; accent?: string }) {
  return text.split("\n").map((line, index) => <Fragment key={index}>
    {index > 0 && <br />}
    {line.split(/(\*[^*]+\*)/).map((part, i) => /^\*[^*]+\*$/.test(part) ? <span key={i} className={accent}>{part.slice(1, -1)}</span> : part)}
  </Fragment>);
}

/** First line in the main colour, the rest muted (two-tone section titles). */
function TwoTone({ text, muted }: { text: string; muted: string }) {
  const [first, ...rest] = text.split("\n");
  return <><Rich text={first} />{rest.length > 0 && <><br /><span className={muted}><Rich text={rest.join("\n")} /></span></>}</>;
}

const paragraphs = (text: string) => text.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean);

export default async function AboutPage() {
  const [page, shops] = await Promise.all([getAboutPage(), getShopLocations()]);
  return <HomeMotion>
    <JsonLd data={cmsStructuredData(page.seo)} />
    <section aria-labelledby="about-heading" className="content-container page-gutter !pt-5 !pb-0 md:!pt-7">
      <nav aria-label="Хлібні крихти" className="flex items-center gap-3 text-xs text-[#666]"><Link href="/" className={`hover:text-[#e53935] ${focus}`}>Головна</Link><span aria-hidden="true">/</span><span aria-current="page">Про нас</span></nav>
      <div className="grid gap-7 pt-10 pb-9 md:pt-14 md:pb-12 lg:grid-cols-[1.35fr_0.65fr] lg:items-end lg:gap-16">
        <div><p className={`${eyebrow} mb-5 flex items-center gap-3`}><span className="h-0.5 w-8 shrink-0 bg-[#e53935]" />{page.heroEyebrow}</p><h1 id="about-heading" className="text-[clamp(38px,4.7vw,76px)] font-bold leading-[1.08] tracking-[-0.045em]"><Rich text={page.heroTitle} /></h1></div>
        <div className="max-w-md"><p className="text-base leading-relaxed text-[#666] md:text-lg">{page.heroText}</p><a href="#our-approach" className={`mt-6 inline-flex min-h-11 items-center gap-5 text-sm font-bold ${focus}`}>Познайомимось ближче <span className="text-lg text-[#e53935]" aria-hidden="true">↓</span></a></div>
      </div>
      <div className="relative overflow-hidden bg-[#e8e4de]">
        <div className="relative h-[330px] sm:h-[420px] lg:h-[510px]"><Image src={page.heroImage} unoptimized={external(page.heroImage)} alt={page.heroImageAlt} fill priority sizes="(min-width: 1760px) 1584px, 100vw" className="object-cover object-[58%_center]" /></div>
        {page.heroNote && <div className="flex items-center justify-between gap-5 bg-[#e53935] px-5 py-5 text-white sm:absolute sm:right-0 sm:bottom-0 sm:w-[330px] sm:p-7"><p className="text-lg font-semibold leading-snug"><Rich text={page.heroNote} accent="" /></p><span className="text-3xl" aria-hidden="true">↗</span></div>}
      </div>
      <div className={`grid divide-y divide-[#e0e0e0] border-b border-[#e0e0e0] sm:divide-x sm:divide-y-0 ${["sm:grid-cols-1", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-4"][Math.min(page.highlights.length, 4) - 1]}`}>
        {page.highlights.map(item => <div key={item.title} className="flex items-center gap-4 px-2 py-5 sm:justify-center sm:px-5 md:py-7"><HomeIcon name={item.icon} size={24} /><div><p className="text-sm font-bold">{item.title}</p>{item.text && <p className="mt-1 text-xs text-[#666]">{item.text}</p>}</div></div>)}
      </div>
    </section>

    <section id="our-approach" aria-labelledby="approach-heading" className="content-container page-gutter grid gap-8 !py-14 md:!py-20 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
      <div data-home-reveal=""><p className={eyebrow}>{page.approachEyebrow}</p><p className="mt-5 max-w-xs text-sm leading-relaxed text-[#666]">{page.approachLead}</p></div>
      <div data-home-reveal=""><h2 id="approach-heading" className="text-[clamp(28px,3vw,46px)] font-bold leading-[1.18] tracking-[-0.03em]"><TwoTone text={page.approachTitle} muted="text-[#777]" /></h2>
        <div className="mt-7 grid gap-5 text-sm leading-7 text-[#666] sm:grid-cols-2 sm:gap-8">{paragraphs(page.approachText).map((text, index) => <p key={index}>{text}</p>)}</div>
        <a href="#contacts" className={`mt-7 inline-flex min-h-11 items-center gap-3 text-sm font-bold text-[#e53935] ${focus}`}>{page.approachLink}<HomeIcon name="arrow-red" size={18} /></a>
      </div>
    </section>

    <section aria-labelledby="materials-heading" className="bg-[#f5f5f5]">
      <div className="content-container page-gutter !py-14 md:!py-20">
        <div data-home-reveal="" className="mb-8 flex flex-col justify-between gap-4 md:mb-10 md:flex-row md:items-end"><div><p className={`${eyebrow} mb-3`}>{page.materialsEyebrow}</p><h2 id="materials-heading" className="text-3xl font-bold tracking-[-0.03em] md:text-[40px]">{page.materialsTitle}</h2></div><p className="max-w-xs text-sm leading-relaxed text-[#666]">{page.materialsText}</p></div>
        <div className="grid gap-6 md:grid-cols-2">{page.materials.map((item, index) => {
          const body = <>
            <div className="relative h-[240px] overflow-hidden sm:h-[320px] lg:h-[380px]"><Image src={item.image} unoptimized={external(item.image)} alt={item.imageAlt ?? item.title} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105" /><span className="absolute top-4 left-4 flex size-10 items-center justify-center bg-white text-xs font-bold">{String(index + 1).padStart(2, "0")}</span></div>
            <div className="p-6 lg:p-8"><h3 className="text-xl font-bold md:text-2xl">{item.title}</h3>{item.text && <p className="mt-3 text-sm leading-relaxed text-[#666]">{item.text}</p>}{item.url && <span className="mt-6 flex items-center justify-between border-t border-[#e0e0e0] pt-5 text-sm font-bold text-[#e53935]">{item.linkLabel ?? "Детальніше"}<HomeIcon name="arrow-red" size={20} /></span>}</div>
          </>;
          return item.url
            ? <Link data-home-reveal="" href={item.url} key={index} className={`group block bg-white ${focus}`}>{body}</Link>
            : <div data-home-reveal="" key={index} className="group block bg-white">{body}</div>;
        })}</div>
      </div>
    </section>

    <section aria-labelledby="steps-heading" className="bg-[#1e1e1e] text-white">
      <div className="content-container page-gutter !py-14 md:!py-20">
        <div data-home-reveal="" className="grid gap-5 lg:grid-cols-2 lg:gap-20"><div><p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#ff7773]">{page.stepsEyebrow}</p><h2 id="steps-heading" className="text-3xl font-bold leading-tight tracking-[-0.03em] md:text-[40px]"><Rich text={page.stepsTitle} accent="text-[#ff7773]" /></h2></div><p className="max-w-lg self-end text-sm leading-7 text-[#bdbdbd]">{page.stepsText}</p></div>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-7">{page.steps.map((step, index) => <li data-home-reveal="" key={index} className="border-t border-[#484848] pt-5"><span className="text-sm font-semibold text-[#ff7773]">{String(index + 1).padStart(2, "0")}<span aria-hidden="true" className="ml-3 text-[#666]">/</span></span><h3 className="mt-6 text-lg font-bold">{step.title}</h3>{step.text && <p className="mt-3 text-sm leading-7 text-[#bdbdbd]">{step.text}</p>}</li>)}</ol>
        <a href="#contacts" className={`mt-10 inline-flex min-h-12 items-center justify-center gap-6 bg-[#e53935] px-6 py-3 text-sm font-bold transition-colors hover:bg-[#c62828] ${focus}`}>{page.stepsButton}<HomeIcon name="arrow-white" size={18} /></a>
      </div>
    </section>
    <Stores shops={shops} />
    <section aria-labelledby="closing-heading" className="content-container page-gutter flex flex-col items-start justify-between gap-6 !py-10 md:flex-row md:items-center md:!py-14">
      <div><p className={`${eyebrow} mb-2`}>{page.closingEyebrow}</p><h2 id="closing-heading" className="text-2xl font-bold tracking-[-0.025em] md:text-3xl">{page.closingTitle}</h2></div>
      <Link href="/#categories" className={`inline-flex min-h-12 shrink-0 items-center gap-6 border border-[#d0d0d0] px-6 py-3 text-sm font-bold transition-colors hover:border-[#e53935] hover:text-[#e53935] ${focus}`}>{page.closingButton}<HomeIcon name="arrow-red" size={18} /></Link>
    </section>
  </HomeMotion>;
}
