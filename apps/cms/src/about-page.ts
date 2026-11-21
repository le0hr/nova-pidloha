/**
 * "Про нас" page: on start, if the single type is still empty, it is filled with the site's current texts and
 * published, so the manager edits the real text instead of an empty form. Photos stay empty: the site then shows
 * its own default photos until one is uploaded. A page that already exists (draft or published) is never touched.
 * The same texts are the website's fallback (apps/web/src/lib/services/about.service.ts) — keep them in sync.
 */
const UID = 'api::about-page.about-page';

export const ABOUT_DEFAULTS = {
  heroEyebrow: 'Нова Підлога та Двері · Черкаси',
  heroTitle: 'Дім починається\nз *відчуття.*',
  heroText: 'Тепло під ногами. Тиша за дверима. Впевненість у кожній деталі. Допомагаємо обрати те, що робить простір вашим.',
  heroImageAlt: 'Світла вітальня з дерев’яною підлогою та лаконічними міжкімнатними дверима',
  heroNote: 'Матеріали для ремонту.\nВідчуття — для життя.',
  highlights: [
    { icon: 'store', title: 'Поруч із вами', text: 'Два магазини у Черкасах' },
    { icon: 'badge-check', title: 'Вибір із розумінням', text: 'Пояснюємо різницю в деталях' },
    { icon: 'settings', title: 'Усе поєднується', text: 'Підлога, двері та фурнітура' },
  ],
  approachEyebrow: 'Наш підхід',
  approachLead: 'Ми віримо, що гарний ремонт починається зі спокійного, усвідомленого вибору.',
  approachTitle: 'Ви обираєте, як жити.\nМи допомагаємо знайти матеріали.',
  approachText: 'Підлога й двері залишаються з вами надовго. Тому для нас важливо, щоб вони подобалися не лише на фото, а й щодня: у ранковому світлі, під босими ногами, у звичних домашніх справах.\n\n'
    + 'У наших магазинах можна роздивитися фактуру, порівняти відтінки й поставити всі запитання. Ми допоможемо розібратися в матеріалах та знайти рішення для вашого простору.',
  approachLink: 'Побачити все наживо',
  materialsEyebrow: 'Дві складові затишку',
  materialsTitle: 'Один дім. Ваша історія.',
  materialsText: 'Від першого кроку до останньої деталі — усе має бути на своєму місці.',
  materials: [
    { title: 'Підлога, яку відчуваєш', text: 'Текстура дерева, приємний дотик, правильний відтінок. Ламінат, SPC та вініл для вашого ритму життя.',
      imageAlt: 'Дерев’яна фактура підлогового покриття', linkLabel: 'Обрати підлогу', url: '/catalog/pidloha' },
    { title: 'Двері, що доповнюють', text: 'Лаконічні чи класичні, світлі чи акцентні. Знайдіть двері, які поєднають кімнати в одну історію.',
      imageAlt: 'Міжкімнатні двері в інтер’єрі', linkLabel: 'Обрати двері', url: '/catalog/mizhkimnatni' },
  ],
  stepsEyebrow: 'Від ідеї до вашого дому',
  stepsTitle: 'Великий вибір.\nЗрозумілі кроки.',
  stepsText: 'Не потрібно знати все про класи зносостійкості, покриття чи дверні коробки. Почнімо з того, що для вас важливо. Решту розберемо разом.',
  steps: [
    { title: 'Почнемо з вашої ідеї', text: 'Розкажіть про кімнату, покажіть фото або поділіться планами. Важливі і стиль, і бюджет, і те, як ви живете.' },
    { title: 'Знайдемо поєднання', text: 'Порівняємо декори, фактури та характеристики. Допоможемо побачити підлогу й двері як частини одного інтер’єру.' },
    { title: 'Продумаємо деталі', text: 'Звернемо увагу на розміри, фурнітуру та комплектуючі. Разом уточнимо, що потрібно саме для вашого проєкту.' },
    { title: 'Узгодимо наступний крок', text: 'Перевіримо комплектацію, обговоримо замовлення, доставку та питання монтажу. Щоб ви знали, що буде далі.' },
  ],
  stepsButton: 'Почнімо з розмови',
  closingEyebrow: 'Нова Підлога та Двері',
  closingTitle: 'Ваш дім. Ваш характер. Ваш вибір.',
  closingButton: 'Знайти своє в каталозі',
};

export async function seedAboutPage(strapi: any) {
  if (!strapi.contentTypes[UID]) return;
  const existing = await strapi.documents(UID).findFirst({ status: 'draft' });
  if (existing) return;
  const page = await strapi.documents(UID).create({ data: ABOUT_DEFAULTS });
  await strapi.documents(UID).publish({ documentId: page.documentId });
  strapi.log.info('About page: filled with the default texts');
}
