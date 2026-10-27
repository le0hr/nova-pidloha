import HomeIcon from "./HomeIcon";
import SectionHeader from "./SectionHeader";

const benefits = [
  { icon: "truck", title: "Безкоштовна доставка", description: "При замовленні на суму від 5 000 ₴ привеземо безкоштовно прямо до вашого під’їзду у Черкасах." },
  { icon: "badge-check", title: "Гарантія якості", description: "Співпрацюємо виключно з перевіреними виробниками та надаємо офіційну фірмову гарантію." },
  { icon: "calculator", title: "Калькулятор кількості", mobileTitle: "Калькулятор", description: "Допоможемо розрахувати точну кількість пачок покриття з урахуванням запасу на підрізання." },
  { icon: "store", title: "Самовивіз з магазинів", mobileTitle: "Самовивіз", description: "Забирайте замовлення особисто в одному з двох просторих шоурумів у Черкасах у зручний час." },
];

export default function Benefits() {
  return (
    <section aria-labelledby="benefits-title" className="content-container page-gutter flex flex-col gap-4 !py-6 md:gap-10 md:!py-16 lg:!py-20">
      <SectionHeader id="benefits-title" eyebrow="Наші переваги" title="Чому обирають нас" mobileTitle="Наші переваги" description="Сервіс, орієнтований на комфорт та надійність" />
      <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
        {benefits.map((benefit) => <div data-home-reveal="" key={benefit.icon} className="flex flex-col items-start gap-3 border border-[#e0e0e0] bg-[#f5f5f5] p-3 md:p-6">
          <div className="flex size-10 items-center justify-center bg-white md:size-14 md:rounded-full md:border md:border-[#e0e0e0]"><HomeIcon name={benefit.icon} size={24} /></div>
          <h3 className="text-sm font-medium leading-snug md:font-bold">{benefit.mobileTitle ? <><span className="md:hidden">{benefit.mobileTitle}</span><span className="hidden md:inline">{benefit.title}</span></> : benefit.title}</h3>
          <p className="hidden text-sm leading-relaxed text-[#666] md:block">{benefit.description}</p>
        </div>)}
      </div>
    </section>
  );
}
