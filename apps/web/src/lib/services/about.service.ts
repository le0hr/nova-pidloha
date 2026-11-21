import { graphqlFetch, mediaUrl } from "@/lib/client";
import { SEO_FIELDS, type CmsSeo } from "@/lib/seo";

export type AboutCard = { title: string; text?: string; image: string; imageAlt?: string; linkLabel?: string; url?: string };
export type AboutPage = {
  heroEyebrow: string; heroTitle: string; heroText: string; heroImage: string; heroImageAlt: string; heroNote: string;
  highlights: { icon: string; title: string; text?: string }[];
  approachEyebrow: string; approachLead: string; approachTitle: string; approachText: string; approachLink: string;
  materialsEyebrow: string; materialsTitle: string; materialsText: string; materials: AboutCard[];
  stepsEyebrow: string; stepsTitle: string; stepsText: string; steps: { title: string; text?: string }[]; stepsButton: string;
  closingEyebrow: string; closingTitle: string; closingButton: string;
  seo: CmsSeo | null;
};

/** The site's texts: used for every field left empty in CMS "Сторінка «Про нас»" (same as apps/cms/src/about-page.ts). */
const DEFAULTS: AboutPage = {
  heroEyebrow: "Нова Підлога та Двері · Черкаси",
  heroTitle: "Дім починається\nз *відчуття.*",
  heroText: "Тепло під ногами. Тиша за дверима. Впевненість у кожній деталі. Допомагаємо обрати те, що робить простір вашим.",
  heroImage: "/images/home/hero.png",
  heroImageAlt: "Світла вітальня з дерев’яною підлогою та лаконічними міжкімнатними дверима",
  heroNote: "Матеріали для ремонту.\nВідчуття — для життя.",
  highlights: [
    { icon: "store", title: "Поруч із вами", text: "Два магазини у Черкасах" },
    { icon: "badge-check", title: "Вибір із розумінням", text: "Пояснюємо різницю в деталях" },
    { icon: "settings", title: "Усе поєднується", text: "Підлога, двері та фурнітура" },
  ],
  approachEyebrow: "Наш підхід",
  approachLead: "Ми віримо, що гарний ремонт починається зі спокійного, усвідомленого вибору.",
  approachTitle: "Ви обираєте, як жити.\nМи допомагаємо знайти матеріали.",
  approachText: "Підлога й двері залишаються з вами надовго. Тому для нас важливо, щоб вони подобалися не лише на фото, а й щодня: у ранковому світлі, під босими ногами, у звичних домашніх справах.\n\n"
    + "У наших магазинах можна роздивитися фактуру, порівняти відтінки й поставити всі запитання. Ми допоможемо розібратися в матеріалах та знайти рішення для вашого простору.",
  approachLink: "Побачити все наживо",
  materialsEyebrow: "Дві складові затишку",
  materialsTitle: "Один дім. Ваша історія.",
  materialsText: "Від першого кроку до останньої деталі — усе має бути на своєму місці.",
  materials: [
    { title: "Підлога, яку відчуваєш", text: "Текстура дерева, приємний дотик, правильний відтінок. Ламінат, SPC та вініл для вашого ритму життя.",
      image: "/images/home/laminate.png", imageAlt: "Дерев’яна фактура підлогового покриття", linkLabel: "Обрати підлогу", url: "/catalog/pidloha" },
    { title: "Двері, що доповнюють", text: "Лаконічні чи класичні, світлі чи акцентні. Знайдіть двері, які поєднають кімнати в одну історію.",
      image: "/images/home/doors.png", imageAlt: "Міжкімнатні двері в інтер’єрі", linkLabel: "Обрати двері", url: "/catalog/mizhkimnatni" },
  ],
  stepsEyebrow: "Від ідеї до вашого дому",
  stepsTitle: "Великий вибір.\nЗрозумілі кроки.",
  stepsText: "Не потрібно знати все про класи зносостійкості, покриття чи дверні коробки. Почнімо з того, що для вас важливо. Решту розберемо разом.",
  steps: [
    { title: "Почнемо з вашої ідеї", text: "Розкажіть про кімнату, покажіть фото або поділіться планами. Важливі і стиль, і бюджет, і те, як ви живете." },
    { title: "Знайдемо поєднання", text: "Порівняємо декори, фактури та характеристики. Допоможемо побачити підлогу й двері як частини одного інтер’єру." },
    { title: "Продумаємо деталі", text: "Звернемо увагу на розміри, фурнітуру та комплектуючі. Разом уточнимо, що потрібно саме для вашого проєкту." },
    { title: "Узгодимо наступний крок", text: "Перевіримо комплектацію, обговоримо замовлення, доставку та питання монтажу. Щоб ви знали, що буде далі." },
  ],
  stepsButton: "Почнімо з розмови",
  closingEyebrow: "Нова Підлога та Двері",
  closingTitle: "Ваш дім. Ваш характер. Ваш вибір.",
  closingButton: "Знайти своє в каталозі",
  seo: null,
};

const ICONS = new Set(["store", "badge-check", "settings", "truck", "calculator", "clock", "map-pin", "phone"]);
const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);
type Raw = Record<string, unknown> & {
  heroImage?: { url?: string } | null;
  highlights?: { icon?: string; title?: string; text?: string }[] | null;
  materials?: { title?: string; text?: string; image?: { url?: string } | null; imageAlt?: string; linkLabel?: string; url?: string }[] | null;
  steps?: { title?: string; text?: string }[] | null;
  seo?: CmsSeo | null;
};

export async function getAboutPage(): Promise<AboutPage> {
  let raw: Raw | null = null;
  try {
    const data = await graphqlFetch<{ aboutPage: Raw | null }>(`
      query AboutPage {
        aboutPage(status: PUBLISHED) {
          heroEyebrow heroTitle heroText heroImage { url } heroImageAlt heroNote
          highlights { icon title text }
          approachEyebrow approachLead approachTitle approachText approachLink
          materialsEyebrow materialsTitle materialsText materials { title text image { url } imageAlt linkLabel url }
          stepsEyebrow stepsTitle stepsText steps { title text } stepsButton
          closingEyebrow closingTitle closingButton
          ${SEO_FIELDS}
        }
      }`, undefined, { revalidate: 60 });
    raw = data.aboutPage;
  } catch {
    // CMS without this content type yet (rolling deploy): the site's own texts.
  }
  if (!raw) return DEFAULTS;

  const page = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS) as (keyof AboutPage)[]) {
    const value = text(raw[key]);
    if (value && typeof DEFAULTS[key] === "string") (page as Record<string, unknown>)[key] = value;
  }
  if (raw.heroImage?.url) page.heroImage = mediaUrl(raw.heroImage.url);
  const highlights = (raw.highlights ?? []).flatMap(item => {
    const title = text(item.title);
    // GraphQL enums use "_" instead of "-".
    const icon = String(item.icon ?? "").replace(/_/g, "-");
    return title ? [{ icon: ICONS.has(icon) ? icon : "store", title, text: text(item.text) }] : [];
  });
  if (highlights.length) page.highlights = highlights;
  const materials = (raw.materials ?? []).flatMap((item, index) => {
    const title = text(item.title);
    if (!title) return [];
    const fallback = DEFAULTS.materials[index % DEFAULTS.materials.length];
    return [{ title, text: text(item.text), image: item.image?.url ? mediaUrl(item.image.url) : fallback.image,
      imageAlt: text(item.imageAlt) ?? title, linkLabel: text(item.linkLabel), url: text(item.url) }];
  });
  if (materials.length) page.materials = materials;
  const steps = (raw.steps ?? []).flatMap(item => (text(item.title) ? [{ title: text(item.title)!, text: text(item.text) }] : []));
  if (steps.length) page.steps = steps;
  page.seo = raw.seo ?? null;
  return page;
}
