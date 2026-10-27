import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HomeMotion from "@/components/home/HomeMotion";
import HomeIcon from "@/components/home/HomeIcon";
import Stores from "@/components/home/Stores";

export const metadata: Metadata = {
  title: "Про нас — Нова Підлога та Двері",
  description: "Підлога та двері для вашого дому. Знайомтеся з нашим підходом та завітайте до виставкових залів Нова Підлога у Черкасах.",
};
const materials = [
  { title: "Підлога, яку відчуваєш", text: "Текстура дерева, приємний дотик, правильний відтінок. Ламінат, SPC та вініл для вашого ритму життя.", image: "laminate", href: "/catalog/pidloha", link: "Обрати підлогу" },
  { title: "Двері, що доповнюють", text: "Лаконічні чи класичні, світлі чи акцентні. Знайдіть двері, які поєднають кімнати в одну історію.", image: "doors", href: "/catalog/mizhkimnatni", link: "Обрати двері" },
];
const steps = [
  { title: "Почнемо з вашої ідеї", text: "Розкажіть про кімнату, покажіть фото або поділіться планами. Важливі і стиль, і бюджет, і те, як ви живете." },
  { title: "Знайдемо поєднання", text: "Порівняємо декори, фактури та характеристики. Допоможемо побачити підлогу й двері як частини одного інтер’єру." },
  { title: "Продумаємо деталі", text: "Звернемо увагу на розміри, фурнітуру та комплектуючі. Разом уточнимо, що потрібно саме для вашого проєкту." },
  { title: "Узгодимо наступний крок", text: "Перевіримо комплектацію, обговоримо замовлення, доставку та питання монтажу. Щоб ви знали, що буде далі." },
];
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e53935]";
const eyebrow = "text-xs font-bold uppercase tracking-[0.16em] text-[#e53935]";

export default function AboutPage() {
  return <HomeMotion>
    <section aria-labelledby="about-heading" className="content-container page-gutter !pt-5 !pb-0 md:!pt-7">
      <nav aria-label="Хлібні крихти" className="flex items-center gap-3 text-xs text-[#666]"><Link href="/" className={`hover:text-[#e53935] ${focus}`}>Головна</Link><span aria-hidden="true">/</span><span aria-current="page">Про нас</span></nav>
      <div className="grid gap-7 pt-10 pb-9 md:pt-14 md:pb-12 lg:grid-cols-[1.35fr_0.65fr] lg:items-end lg:gap-16">
        <div><p className={`${eyebrow} mb-5 flex items-center gap-3`}><span className="h-0.5 w-8 shrink-0 bg-[#e53935]" />Нова Підлога та Двері · Черкаси</p><h1 id="about-heading" className="text-[clamp(38px,4.7vw,76px)] font-bold leading-[1.08] tracking-[-0.045em]">Дім починається<br />з <span className="text-[#e53935]">відчуття.</span></h1></div>
        <div className="max-w-md"><p className="text-base leading-relaxed text-[#666] md:text-lg">Тепло під ногами. Тиша за дверима. Впевненість у кожній деталі. Допомагаємо обрати те, що робить простір вашим.</p><a href="#our-approach" className={`mt-6 inline-flex min-h-11 items-center gap-5 text-sm font-bold ${focus}`}>Познайомимось ближче <span className="text-lg text-[#e53935]" aria-hidden="true">↓</span></a></div>
      </div>
      <div className="relative overflow-hidden bg-[#e8e4de]">
        <div className="relative h-[330px] sm:h-[420px] lg:h-[510px]"><Image src="/images/home/hero.png" alt="Світла вітальня з дерев’яною підлогою та лаконічними міжкімнатними дверима" fill priority sizes="(min-width: 1760px) 1584px, 100vw" className="object-cover object-[58%_center]" /></div>
        <div className="flex items-center justify-between gap-5 bg-[#e53935] px-5 py-5 text-white sm:absolute sm:right-0 sm:bottom-0 sm:w-[330px] sm:p-7"><p className="text-lg font-semibold leading-snug">Матеріали для ремонту.<br />Відчуття — для життя.</p><span className="text-3xl" aria-hidden="true">↗</span></div>
      </div>
      <div className="grid divide-y divide-[#e0e0e0] border-b border-[#e0e0e0] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[{ icon: "store", title: "Поруч із вами", text: "Два магазини у Черкасах" }, { icon: "badge-check", title: "Вибір із розумінням", text: "Пояснюємо різницю в деталях" }, { icon: "settings", title: "Усе поєднується", text: "Підлога, двері та фурнітура" }].map(item => <div key={item.title} className="flex items-center gap-4 px-2 py-5 sm:justify-center sm:px-5 md:py-7"><HomeIcon name={item.icon} size={24} /><div><p className="text-sm font-bold">{item.title}</p><p className="mt-1 text-xs text-[#666]">{item.text}</p></div></div>)}
      </div>
    </section>

    <section id="our-approach" aria-labelledby="approach-heading" className="content-container page-gutter grid gap-8 !py-14 md:!py-20 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
      <div data-home-reveal=""><p className={eyebrow}>Наш підхід</p><p className="mt-5 max-w-xs text-sm leading-relaxed text-[#666]">Ми віримо, що гарний ремонт починається зі спокійного, усвідомленого вибору.</p></div>
      <div data-home-reveal=""><h2 id="approach-heading" className="text-[clamp(28px,3vw,46px)] font-bold leading-[1.18] tracking-[-0.03em]">Ви обираєте, як жити.<br /><span className="text-[#777]">Ми допомагаємо знайти матеріали.</span></h2>
        <div className="mt-7 grid gap-5 text-sm leading-7 text-[#666] sm:grid-cols-2 sm:gap-8"><p>Підлога й двері залишаються з вами надовго. Тому для нас важливо, щоб вони подобалися не лише на фото, а й щодня: у ранковому світлі, під босими ногами, у звичних домашніх справах.</p><p>У наших магазинах можна роздивитися фактуру, порівняти відтінки й поставити всі запитання. Ми допоможемо розібратися в матеріалах та знайти рішення для вашого простору.</p></div>
        <a href="#contacts" className={`mt-7 inline-flex min-h-11 items-center gap-3 text-sm font-bold text-[#e53935] ${focus}`}>Побачити все наживо<HomeIcon name="arrow-red" size={18} /></a>
      </div>
    </section>

    <section aria-labelledby="materials-heading" className="bg-[#f5f5f5]">
      <div className="content-container page-gutter !py-14 md:!py-20">
        <div data-home-reveal="" className="mb-8 flex flex-col justify-between gap-4 md:mb-10 md:flex-row md:items-end"><div><p className={`${eyebrow} mb-3`}>Дві складові затишку</p><h2 id="materials-heading" className="text-3xl font-bold tracking-[-0.03em] md:text-[40px]">Один дім. Ваша історія.</h2></div><p className="max-w-xs text-sm leading-relaxed text-[#666]">Від першого кроку до останньої деталі — усе має бути на своєму місці.</p></div>
        <div className="grid gap-6 md:grid-cols-2">{materials.map((item, index) => <Link data-home-reveal="" href={item.href} key={item.href} className={`group block bg-white ${focus}`}>
          <div className="relative h-[240px] overflow-hidden sm:h-[320px] lg:h-[380px]"><Image src={`/images/home/${item.image}.png`} alt={item.image === "doors" ? "Міжкімнатні двері в інтер’єрі" : "Дерев’яна фактура підлогового покриття"} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105" /><span className="absolute top-4 left-4 flex size-10 items-center justify-center bg-white text-xs font-bold">0{index + 1}</span></div>
          <div className="p-6 lg:p-8"><h3 className="text-xl font-bold md:text-2xl">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-[#666]">{item.text}</p><span className="mt-6 flex items-center justify-between border-t border-[#e0e0e0] pt-5 text-sm font-bold text-[#e53935]">{item.link}<HomeIcon name="arrow-red" size={20} /></span></div>
        </Link>)}</div>
      </div>
    </section>

    <section aria-labelledby="steps-heading" className="bg-[#1e1e1e] text-white">
      <div className="content-container page-gutter !py-14 md:!py-20">
        <div data-home-reveal="" className="grid gap-5 lg:grid-cols-2 lg:gap-20"><div><p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#ff7773]">Від ідеї до вашого дому</p><h2 id="steps-heading" className="text-3xl font-bold leading-tight tracking-[-0.03em] md:text-[40px]">Великий вибір.<br />Зрозумілі кроки.</h2></div><p className="max-w-lg self-end text-sm leading-7 text-[#bdbdbd]">Не потрібно знати все про класи зносостійкості, покриття чи дверні коробки. Почнімо з того, що для вас важливо. Решту розберемо разом.</p></div>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-7">{steps.map((step, index) => <li data-home-reveal="" key={step.title} className="border-t border-[#484848] pt-5"><span className="text-sm font-semibold text-[#ff7773]">0{index + 1}<span aria-hidden="true" className="ml-3 text-[#666]">/</span></span><h3 className="mt-6 text-lg font-bold">{step.title}</h3><p className="mt-3 text-sm leading-7 text-[#bdbdbd]">{step.text}</p></li>)}</ol>
        <a href="#contacts" className={`mt-10 inline-flex min-h-12 items-center justify-center gap-6 bg-[#e53935] px-6 py-3 text-sm font-bold transition-colors hover:bg-[#c62828] ${focus}`}>Почнімо з розмови<HomeIcon name="arrow-white" size={18} /></a>
      </div>
    </section>
    <Stores />
    <section aria-labelledby="closing-heading" className="content-container page-gutter flex flex-col items-start justify-between gap-6 !py-10 md:flex-row md:items-center md:!py-14">
      <div><p className={`${eyebrow} mb-2`}>Нова Підлога та Двері</p><h2 id="closing-heading" className="text-2xl font-bold tracking-[-0.025em] md:text-3xl">Ваш дім. Ваш характер. Ваш вибір.</h2></div>
      <Link href="/#categories" className={`inline-flex min-h-12 shrink-0 items-center gap-6 border border-[#d0d0d0] px-6 py-3 text-sm font-bold transition-colors hover:border-[#e53935] hover:text-[#e53935] ${focus}`}>Знайти своє в каталозі<HomeIcon name="arrow-red" size={18} /></Link>
    </section>
  </HomeMotion>;
}
