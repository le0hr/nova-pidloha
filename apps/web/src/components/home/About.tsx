import SectionHeader from "./SectionHeader";
import RollingNumber from "./RollingNumber";

const stats = [
  { value: "2", label: "Великих магазини у Черкасах" },
  { value: "500+", label: "Унікальних моделей у каталозі" },
  { value: "5000+", label: "Задоволених сімей у Черкасах" },
  { value: "100%", label: "Задоволені якістю сервісу" },
];

export default function About() {
  return (
    <section aria-labelledby="about-title" className="hidden bg-white md:block">
      <div className="content-container page-gutter grid gap-10 !py-16 lg:grid-cols-[1.4fr_1fr] lg:gap-16 lg:!py-20">
        <div className="flex flex-col justify-center gap-4">
          <SectionHeader id="about-title" eyebrow="Про компанію" title="Професіонали своєї справи" description="Ми створюємо простір, в якому хочеться жити. Кожен рулон вінілу та кожне дверне полотно підібрані з думкою про довговічність." />
          <p className="text-sm leading-relaxed text-[#666]">Понад 5 років ми допомагаємо жителям Черкас та області створювати бездоганні підлоги та встановлювати надійні міжкімнатні двері. Ми не просто продаємо матеріали — ми забезпечуємо комплексний супровід від вибору до монтажу.</p>
          <div className="flex flex-wrap items-center gap-3 pt-2"><span className="border border-[#d8e7d9] bg-white px-3 py-2 text-xs font-bold text-[#388e3c]">LiqPay безпечна оплата</span><p className="text-xs text-[#666]">Офіційний дилер брендів Kronospan, Classen, Rocko, Porta.</p></div>
        </div>
        <dl className="grid grid-cols-2 gap-4">
          {stats.map((stat) => <div data-home-reveal="" key={stat.value} className="flex flex-col gap-2 border border-[#e0e0e0] bg-white p-6"><dt className="order-2 text-sm font-semibold">{stat.label}</dt><dd className="text-[40px] font-extrabold leading-none text-[#e53935]"><RollingNumber value={stat.value} /></dd></div>)}
        </dl>
      </div>
    </section>
  );
}
