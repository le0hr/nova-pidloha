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
    name: 'Назва', slug: ['Адреса (slug)', 'Частина адреси сторінки товару; не змінюйте без потреби — зламаються старі посилання'],
    description: ['Опис', 'Повний опис на сторінці товару. Абзаци розділяйте порожнім рядком'],
    shortDescription: ['Короткий опис', 'Одне речення для карток, пошуку й Google'],
    price: ['Ціна «від»', 'Зазвичай рахується з варіацій'], category: 'Категорія', brand: 'Бренд', filter_values: 'Значення фільтрів',
    isFeatured: ['Популярний', 'Показувати в «Популярних товарах» на головній'], isNew: ['Новинка', 'Позначка «Новинка» на картці'], isPromo: ['Акція', 'Позначка «Акція» на картці'],
    isSale: ['Розпродаж', 'Позначка «Розпродаж» на картці'],
    product_variations: 'Варіації (кольори, скло, розміри)', external_id: ['Ключ імпорту', 'Не змінюється: за ним імпорт знаходить товар'],
    active: ['Показувати на сайті', 'Вимкніть, щоб сховати товар, не видаляючи'],
    characteristics: ['Характеристики', 'Таблиця на вкладці «Характеристики»'],
    addons: ['Комплектація', 'Коробка, лиштва, добори тощо, які можна додати до замовлення'], image: 'Головне фото',
    size_rules: ['Нестандартні розміри', 'Якщо порожньо — діють правила бренду'], size_notes: 'Примітки до розмірів', seo: 'SEO',
  },
  'api::product-variation.product-variation': {
    products: 'Товар', price: 'Ціна', decor: 'Декор / колекція', decor_color: 'Колір', image: 'Фото', decor_glass: 'Скло',
    architrave_types: 'Комплектація', slug: 'Адреса (slug)', external_id: ['Ключ імпорту', 'Не змінюється: за ним імпорт знаходить варіацію'],
    active: ['Показувати на сайті', 'Вимкніть, щоб сховати варіацію'], sku: 'Артикул', note: 'Примітка', supplier_code: 'Код постачальника',
    filter_values: 'Значення фільтрів', addons: 'Комплектація',
    width: ['Ширина, мм', 'Стандартна ширина полотна цієї варіації'], height: ['Висота, мм', 'Стандартна висота полотна цієї варіації'],
    options: ['Параметри вибору', 'Окремі кроки вибору на сторінці товару: конструкція, сторона відкривання, кромка…'],
    packArea: ['Площа упаковки, м²', 'Підлога продається цілими упаковками; порожньо — поштучно'], boardSize: ['Розмір дошки, мм', 'Напр. 1285×192×8'],
    availability: ['Наявність', 'in_stock — є на складі, on_order — під замовлення; порожньо — нічого не показувати'],
    characteristics: ['Характеристики', 'Клас, товщина, фаска, декор № цієї варіації; з них будуються фільтри підлоги'],
  },
  'api::category.category': {
    name: 'Назва', slug: ['Адреса (slug)', 'Частина адреси категорії; не змінюйте — зламаються посилання'],
    description: ['Опис', 'Текст під товарами категорії (2–4 абзаци). На головній — лише перше речення'], image: 'Фото',
    children: 'Підкатегорії', parent: 'Батьківська категорія', isFeatured: ['На головній', 'Показувати в «Категоріях» на головній'],
    products: 'Товари', filter_groups: 'Групи фільтрів', external_id: 'Ключ імпорту', seo: 'SEO',
  },
  'api::brand.brand': {
    name: 'Назва', slug: 'Адреса (slug)', products: 'Товари', external_id: 'Ключ імпорту',
    size_rules: ['Нестандартні розміри', 'Правила для всіх товарів бренду (товар може мати власні)'],
  },
  'api::decor.decor': { name: 'Назва', decor_colors: 'Кольори', product_variations: 'Варіації', external_id: 'Ключ імпорту' },
  'api::decor-color.decor-color': {
    name: 'Назва', image: ['Фото кольору', 'Квадратний фрагмент текстури для вибору кольору'], decor: 'Декор / колекція',
    product_variations: 'Варіації', external_id: 'Ключ імпорту',
  },
  'api::decor-glass.decor-glass': { name: 'Назва', product_variations: 'Варіації', external_id: 'Ключ імпорту' },
  'api::architrave-type.architrave-type': {
    name: 'Назва', additionalCost: 'Доплата', product_variations: 'Варіації', external_id: 'Ключ імпорту',
    group: ['Група', 'Наприклад «Коробка», «Лиштва», «Добір»'], price: 'Ціна',
  },
  'api::filter-code.filter-code': { name: 'Назва', slug: 'Адреса (slug)', filter_group: 'Група фільтрів', products: 'Товари', external_id: 'Ключ імпорту' },
  'api::filter-group.filter-group': {
    name: 'Назва', slug: 'Адреса (slug)', type: 'Тип', filter_values: 'Значення', categories: 'Категорії', external_id: 'Ключ імпорту',
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
