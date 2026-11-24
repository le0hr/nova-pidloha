/**
 * Ukrainian field names and hints in the admin (Content Manager → "Configure the view" labels/descriptions).
 * Applied on every start, but only to fields whose label is still Strapi's default (the field's code name) or the
 * value we set earlier — a label renamed by hand in the admin stays. Order and payment-attempt labels are set by
 * checkout/admin.ts. Enumeration values (e.g. slide kind) cannot be translated by Strapi; their hints explain them.
 */
type Label = string | [label: string, description: string];
type Labels = Record<string, Record<string, Label>>;

const SEO_HINT = 'Необов\'язково: заповнене поле замінює текст, який сайт складає сам';

export const LABELS: Labels = {
  'api::product.product': {
    name: ['Назва', 'Як на сайті, напр. «ALIANO AL-03»; колір і розмір — у варіаціях'],
    slug: ['Адреса (slug)', 'Частина адреси сторінки товару; не змінюйте без потреби — зламаються старі посилання'],
    description: ['Опис', 'Повний опис на сторінці товару. Абзаци розділяйте порожнім рядком'],
    shortDescription: ['Короткий опис', 'Одне речення для карток, пошуку й Google'],
    price: ['Ціна «від», грн', 'Найменша ціна варіацій, для карток і сортування; підлога — за м²'],
    category: ['Категорія', 'Найточніша підкатегорія; від неї залежать меню, фільтри й вигляд сторінки'], brand: ['Бренд', 'Виробник'],
    filter_values: ['Значення фільтрів', 'За чим товар знаходять у каталозі: колір, клас, товщина…'],
    isFeatured: ['Популярний', 'Показувати в «Популярних товарах» на головній'], isNew: ['Новинка', 'Плашка New на картці'],
    isPromo: ['Акція', 'Плашка «Акція» на картці; ціну не змінює'], isSale: ['Розпродаж', 'Плашка «Розпродаж» на картці; ціну не змінює'],
    product_variations: ['Варіації', 'Кольори, скло, розміри — кожна зі своєю ціною, фото й комплектацією'],
    external_id: ['Ключ імпорту', 'Не змінюється: за ним імпорт знаходить товар'],
    active: ['Показувати на сайті', 'Вимкніть, щоб сховати товар, не видаляючи'],
    characteristics: ['Характеристики', 'Таблиця на вкладці «Характеристики»; однакове для всіх варіацій'],
    addons: ['Комплектація для всіх кольорів', 'Лише те, що підходить усім варіаціям. Коробка, лиштва, добір під колір — у самій варіації'],
    image: ['Головне фото', 'Перше фото на картці й у Google; фото кольорів — у варіаціях'],
    size_rules: ['Нестандартні розміри', 'Лише двері. Якщо порожньо — діють правила бренду'],
    size_notes: ['Примітки до розмірів', 'Лише двері. Текст, який з\'являється при виборі розміру'], seo: 'SEO',
  },
  'api::product-variation.product-variation': {
    products: ['Товар', 'До якого товару належить варіація'], active: ['Показувати на сайті', 'Вимкніть, щоб сховати лише цю варіацію'],
    decor: ['Декор / тип покриття', 'Перший крок вибору, напр. «PP», «Ламінат»'], decor_color: ['Колір', 'Колір саме цього декору'],
    decor_glass: ['Скло', 'Двері; порожньо — без вибору скла'], architrave_types: ['Кромка', 'Двері; не комплектація — вона нижче'],
    image: ['Фото', 'Фото саме цього кольору і скла'], note: ['Примітка під фото', 'Напр. «фото іншого кольору»'],
    price: ['Ціна, грн', 'Двері — за полотно, підлога — за м², решта — за штуку'],
    availability: ['Наявність', 'in_stock — є на складі, on_order — під замовлення; порожньо — нічого не показувати'],
    sku: ['Артикул', 'Видно менеджеру в замовленні'],
    width: ['Ширина, мм', 'Двері: стандартна ширина полотна цієї варіації'], height: ['Висота, мм', 'Двері: стандартна висота полотна цієї варіації'],
    options: ['Параметри вибору', 'Додаткові кроки на сторінці товару: конструкція, сторона відкривання, кромка…'],
    packArea: ['Площа упаковки, м²', 'Підлога: продається цілими упаковками; порожньо — поштучно'],
    boardSize: ['Розмір дошки, мм', 'Підлога, напр. 1285×192×8'],
    characteristics: ['Характеристики варіації', 'Клас, товщина, фаска, декор №; з них будуються фільтри підлоги'],
    addons: ['Комплектація цього кольору', 'Коробка, лиштва, добір, плінтус у колір. На сайті додається до «Комплектації для всіх кольорів» товару'],
    filter_values: ['Значення фільтрів', 'Заповнює імпорт; зазвичай досить фільтрів товару'],
    supplier_code: ['Код постачальника', 'Не видно на сайті'], slug: ['Адреса (slug)', 'Не змінюйте: на неї спираються кошики покупців'],
    external_id: ['Ключ імпорту', 'Не змінюється: за ним імпорт знаходить варіацію'],
  },
  'api::category.category': {
    name: ['Назва', 'У меню, каталозі й заголовку сторінки'], isFeatured: ['На головній', 'Показувати в «Категоріях» на головній'],
    parent: ['Батьківська категорія', 'Порожньо — верхній рівень'], image: ['Фото', 'Плитка категорії'],
    description: ['Опис', 'Текст під товарами категорії (2–4 абзаци). На головній — лише перше речення'],
    children: ['Підкатегорії', 'Заповнюється саме, якщо в підкатегорії вказати батьківську'], products: 'Товари',
    filter_groups: ['Групи фільтрів', 'Які фільтри показувати в цій категорії'],
    slug: ['Адреса (slug)', 'Частина адреси категорії; не змінюйте — зламаються посилання'],
    external_id: ['Ключ імпорту', 'Не змінюється'], seo: 'SEO',
  },
  'api::brand.brand': {
    name: ['Назва', 'Як на сайті й у фільтрі «Виробник»'], size_rules: ['Нестандартні розміри', 'Правила для всіх дверей бренду (товар може мати власні)'],
    products: 'Товари', slug: ['Адреса (slug)', 'Не змінюйте без потреби'], external_id: ['Ключ імпорту', 'Не змінюється'],
  },
  'api::decor.decor': {
    name: ['Назва', 'Напр. «PP», «Sincrolam», «Ламінат»'], decor_colors: ['Кольори', 'Кольори цього декору'], product_variations: 'Варіації',
    external_id: ['Ключ імпорту', 'Не змінюється'],
  },
  'api::decor-color.decor-color': {
    name: ['Назва', 'Як у виборі кольору на сайті'], decor: ['Декор / тип покриття', 'До якого декору належить колір'],
    image: ['Фото кольору', 'Квадратний фрагмент текстури для вибору кольору'],
    product_variations: 'Варіації', external_id: ['Ключ імпорту', 'Не змінюється'],
  },
  'api::decor-glass.decor-glass': {
    name: ['Назва', 'Як у виборі скла на сайті'], product_variations: 'Варіації', external_id: ['Ключ імпорту', 'Не змінюється'],
  },
  'api::architrave-type.architrave-type': {
    group: ['Група', 'Точно: «Коробка», «Лиштва», «Добірна дошка», «Плінтус»… Від групи залежить кількість: лиштва — 2,5 шт на сторону, коробка й добір — 2,5 шт на двері, плінтус — поштучно'],
    name: ['Назва', 'Якщо ціна вже за комплект, у назві має бути «2,5 шт» — інакше сайт помножить її на 2,5'],
    additionalCost: ['Ціна на сайті, грн', 'За одну штуку або за комплект, як у назві'], price: ['Ціна з прайсу, грн', 'Береться, лише якщо «Ціна на сайті» порожня'],
    product_variations: ['Варіації з цією кромкою', 'Лише для кромок; комплектацію додавайте у варіації або товарі'],
    external_id: ['Ключ імпорту', 'Не змінюється'],
  },
  'api::filter-group.filter-group': {
    name: ['Назва', 'Заголовок фільтра'], type: ['Тип', 'select — список, color — кольори, price — ціна, boolean — так/ні'],
    categories: ['Категорії', 'Де показувати фільтр'], filter_values: ['Значення', 'Варіанти у фільтрі'],
    slug: ['Адреса (slug)', 'Частина адреси каталогу; не змінюйте'], external_id: ['Ключ імпорту', 'Не змінюється'],
  },
  'api::filter-code.filter-code': {
    name: ['Назва', 'Варіант у фільтрі, напр. «32 клас»'], filter_group: ['Група фільтрів', 'До якого фільтра належить'], products: ['Товари', 'Товари з цим значенням'],
    slug: ['Адреса (slug)', 'Частина адреси каталогу; не змінюйте'], external_id: ['Ключ імпорту', 'Не змінюється'],
  },
  'api::global.global': {
    phone: ['Телефон', 'Основний телефон у шапці й підвалі'], email: 'Email',
    heroEnabled: ['Показувати банер на головній', 'Вимкніть, щоб сховати весь слайдер'],
    heroSlides: ['Слайди банера', 'Після карти магазинів; порядок можна змінити перетягуванням'],
    promoTicker: ['Бігучий рядок', 'Червона плашка акції на головній'],
    shopLocations: ['Магазини', 'Карта, список магазинів на головній і в «Про нас», самовивіз'], seo: 'SEO головної сторінки',
  },
  'api::about-page.about-page': {
    heroEyebrow: ['Надзаголовок', 'Маленький червоний текст над заголовком'],
    heroTitle: ['Заголовок', 'Новий рядок — перенос, *слово* — червоним'], heroText: 'Текст біля заголовка',
    heroImage: ['Головне фото', 'Порожнє — стандартне фото сайту'], heroImageAlt: ['Опис фото', 'Для Google і незрячих'],
    heroNote: ['Червона плашка на фото', 'Новий рядок — перенос'], highlights: 'Переваги під фото',
    approachEyebrow: 'Блок «Підхід»: надзаголовок', approachLead: 'Блок «Підхід»: короткий текст зліва',
    approachTitle: ['Блок «Підхід»: заголовок', 'Другий рядок — сірим'], approachText: ['Блок «Підхід»: текст', 'Абзаци розділяйте порожнім рядком'],
    approachLink: 'Блок «Підхід»: текст посилання', materialsEyebrow: 'Картки: надзаголовок', materialsTitle: 'Картки: заголовок',
    materialsText: 'Картки: текст', materials: 'Картки з фото', stepsEyebrow: 'Кроки: надзаголовок',
    stepsTitle: ['Кроки: заголовок', 'Новий рядок — перенос'], stepsText: 'Кроки: текст', steps: 'Кроки', stepsButton: 'Кроки: текст кнопки',
    closingEyebrow: 'Внизу: надзаголовок', closingTitle: 'Внизу: заголовок', closingButton: 'Внизу: текст кнопки', seo: 'SEO',
  },
  'home.hero-slide': {
    enabled: 'Показувати', kind: ['Вид слайда', 'promotion — фото з текстом і кнопками; image — лише картинка (уся клікабельна); map — карта'],
    title: 'Заголовок', eyebrow: 'Надзаголовок', description: 'Опис', mobileDescription: ['Опис на телефоні', 'Коротший текст для телефона'],
    image: 'Фото', imageAlt: ['Опис фото', 'Для Google і незрячих'], buttonLabel: 'Кнопка: текст', buttonUrl: ['Кнопка: посилання', 'Напр. /catalog/pidloha-laminat'],
    secondaryButtonLabel: 'Друга кнопка: текст', secondaryButtonUrl: 'Друга кнопка: посилання', mapEmbedUrl: 'Карта: посилання для вбудовування',
    mapTitle: 'Карта: заголовок', body: 'Додатковий текст', badge: 'Значок (напр. «-20%»)', mobileImage: ['Фото для телефона', 'Вертикальне; порожнє — головне фото'],
    alignment: ['Вирівнювання тексту', 'left — ліворуч, center — по центру, right — праворуч'],
  },
  'home.promo-ticker': {
    enabled: 'Показувати', label: 'Мітка', highlight: 'Виділений текст', text: 'Текст', note: 'Примітка', url: 'Посилання',
  },
  'shops.location': {
    name: 'Назва', address: 'Адреса', description: ['Опис', 'Кілька речень про магазин; новий рядок — перенос'],
    lat: ['Широта', 'З Google Maps: правий клік на точці → перше число'], lng: ['Довгота', 'Друге число з Google Maps'],
    placeId: ['Google Place ID', 'Необов\'язково: для точного маршруту'], phone: 'Телефон', hours: ['Години роботи', 'Напр. «Пн–Сб 9:00–18:00, Нд 10:00–16:00»'],
    image: ['Фото', 'Порожнє — стандартне фото'],
  },
  'about.highlight': { icon: ['Іконка', 'store — магазин, badge-check — галочка, settings — шестерня, truck — доставка, calculator, clock, map-pin, phone'], title: 'Заголовок', text: 'Текст' },
  'about.card': { title: 'Заголовок', text: 'Текст', image: ['Фото', 'Порожнє — стандартне фото'], imageAlt: 'Опис фото', linkLabel: 'Текст посилання', url: ['Посилання', 'Напр. /catalog/pidloha'] },
  'about.step': { title: 'Заголовок', text: 'Текст' },
  'catalog.characteristic': { name: 'Назва', value: 'Значення', unit: 'Одиниця' },
  'catalog.variation-option': { name: ['Назва', 'Однакова в усіх варіаціях товару, напр. «Сторона відкривання»'], value: 'Значення',
    changesLook: ['Змінює фото', 'Увімкніть, якщо цей параметр видно на фото (напр. конструкція); кромка чи сторона — ні'] },
  'catalog.size-rule': {
    dimension: ['Розмір', 'height — висота, width — ширина'], min: 'Від (мм)', max: 'До (мм)', step: ['Крок (мм)', 'Введений розмір округлюється вгору до кроку'],
    percent: ['Доплата, %', 'До ціни полотна'], decors: ['Лише для кольорів', 'Через кому; порожньо — для всіх'],
  },
  'catalog.size-note': { dimension: ['Розмір', 'height — висота, width — ширина'], value: 'Значення (мм)', text: 'Примітка' },
  'shared.seo': {
    metaTitle: ['Заголовок (до 60 символів)', SEO_HINT], metaDescription: ['Опис (до 160 символів)', SEO_HINT],
    metaImage: 'Картинка для соцмереж', openGraph: 'Соцмережі (Open Graph)', keywords: 'Ключові слова',
    metaRobots: ['Meta robots', 'Напр. noindex — прибрати сторінку з Google'], metaViewport: 'Meta viewport',
    canonicalURL: ['Канонічна адреса', 'Рідко потрібна'], structuredData: 'Структуровані дані (JSON-LD)',
  },
  'shared.open-graph': { ogTitle: 'Заголовок', ogDescription: 'Опис', ogImage: 'Картинка', ogUrl: 'Адреса', ogType: 'Тип' },
};

const STORE_KEY = 'nova-admin-labels';

export async function applyAdminLabels(strapi: any) {
  const contentTypes = strapi.plugin('content-manager').service('content-types');
  const components = strapi.plugin('content-manager').service('components');
  const store = strapi.store({ type: 'plugin', name: 'content-manager', key: STORE_KEY });
  const previous: Labels = (await store.get()) ?? {};
  const text = (value: Label) => (Array.isArray(value) ? value : [value, '']);

  for (const [uid, fields] of Object.entries(LABELS)) {
    const isComponent = !uid.startsWith('api::');
    const model = isComponent ? strapi.components[uid] : strapi.contentTypes[uid];
    if (!model) continue;
    const service = isComponent ? components : contentTypes;
    const config = await service.findConfiguration(model);
    let changed = false;
    for (const [field, value] of Object.entries(fields)) {
      const meta = config.metadatas?.[field];
      if (!meta) continue;
      const [label, description] = text(value);
      const [oldLabel, oldDescription] = previous[uid]?.[field] ? text(previous[uid][field]) : [field, ''];
      // Only Strapi's default or our own earlier value: a label a person renamed in the admin is kept.
      if (meta.edit && [field, oldLabel].includes(meta.edit.label) && (meta.edit.label !== label || (meta.edit.description ?? '') !== description)) {
        if ([oldDescription, ''].includes(meta.edit.description ?? '')) meta.edit = { ...meta.edit, label, description };
        else meta.edit = { ...meta.edit, label };
        changed = true;
      }
      if (meta.list && [field, oldLabel].includes(meta.list.label) && meta.list.label !== label) {
        meta.list = { ...meta.list, label };
        changed = true;
      }
    }
    if (changed) await service.updateConfiguration(model, config);
  }
  await store.set({ value: LABELS });
}
