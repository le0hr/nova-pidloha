/**
 * Characteristics, description and short description for products that lack them — built only from catalog data
 * (variation fields and characteristics, brand, category, existing characteristics), no invented specs.
 *
 *   Characteristics: missing ones are added (an existing one with the same name is never changed). A value that
 *   differs between variations is listed ("8, 10 мм"); one with too many different values is left out.
 *   Description / short description: written only when empty (a manager's text stays). No prices or counts.
 *
 * Usage (from apps/cms; on the server inside the container with STRAPI_SCRIPT=1):
 *   STRAPI_SCRIPT=1 node scripts/fill-product-info.js --preview=FILE.json   # plan only
 *   STRAPI_SCRIPT=1 node scripts/fill-product-info.js --apply               # write and publish
 *   STRAPI_URL=… STRAPI_TOKEN=… node scripts/fill-product-info.js --remote [--preview=…|--apply]
 *                 another CMS (e.g. the server) over REST with an API token that may update products
 */
const fs = require('node:fs');
const path = require('node:path');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const APPLY = process.argv.includes('--apply');
const PREVIEW = arg('preview');
const REMOTE = process.argv.includes('--remote');
const PRODUCT = 'api::product.product';

const num = (value) => String(value).trim().replace(/\s*(mm|мм)$/i, '').replace('.', ',');
const uniq = (values) => [...new Set(values.filter((v) => v != null && String(v).trim() !== '').map((v) => String(v).trim()))];
const byNumber = (a, b) => parseFloat(a.replace(',', '.')) - parseFloat(b.replace(',', '.')) || a.localeCompare(b, 'uk');
const list = (values, max = 6) => (values.length && values.length <= max ? values.join(', ') : null);
const lower = (text) => text.charAt(0).toLowerCase() + text.slice(1);

function bevel(value) {
  const v = String(value).trim().toLowerCase().replace(/\s+/g, '');
  if (/^(micro|мікро)v4$/.test(v)) return 'мікрофаска з 4 сторін';
  if (/^(4v|v4|4v\+1|4bevels|так)$/.test(v)) return 'з 4 сторін (4V)';
  if (v === '2v') return 'з 2 сторін';
  if (v === 'pressedbevel') return 'пресована';
  if (v === 'v') return 'є';
  return String(value).trim();
}
function lock(value) {
  const v = String(value).trim();
  if (/^клей/i.test(v)) return null; // glue-down: shown as the installation method
  if (/^замок$/i.test(v)) return null;
  if (/^uniclic$/i.test(v)) return 'Uniclic';
  return v;
}
const coating = (value) => (/^пвх$/i.test(value.trim()) ? 'PVC' : value.trim());

const CLASS_TEXT = {
  31: 'Клас 31 підходить для спальні й інших кімнат з помірним навантаженням.',
  32: 'Клас 32 підходить для будь-яких житлових кімнат, зокрема коридору й кухні.',
  33: 'Клас 33 розрахований на інтенсивне навантаження: удома служить із запасом, підходить і для офісу чи магазину.',
  34: 'Клас 34 розрахований на приміщення з дуже високою прохідністю.',
  42: 'Комерційний клас 42 витримує інтенсивне навантаження: удома служить із запасом, підходить і для офісу.',
};

function kindOf(slug) {
  if (slug.startsWith('pidloha-laminat')) return 'laminate';
  if (slug.includes('spc')) return 'spc';
  if (slug.includes('lvt')) return 'lvt';
  if (slug.startsWith('dveri-vhidni-vulychni')) return 'street';
  if (slug.startsWith('dveri-vhidni')) return 'flat';
  if (slug === 'mizhkimnatni' || slug.startsWith('dveri-mizhkimnatni')) return 'interior';
  return null;
}

/** Values across the variations: `field` is a function of a variation (value or list). */
const values = (variations, field) => uniq(variations.flatMap((v) => field(v) ?? []));
/** A variation characteristic (specs from the price list: «Клас зносостійкості», «Товщина»…). */
const spec = (name) => (v) => (v.characteristics ?? []).filter((c) => c.name === name).map((c) => c.value);
const option = (name) => (v) => (v.options ?? []).filter((o) => o.name === name).map((o) => o.value);
/** Interior door subcategory (Каркасно-щитові, Збірні…) stands for the construction. */
const construction = (product) => (product.category?.parent?.slug === 'mizhkimnatni' ? product.category.name : null);

function plan(product) {
  const kind = kindOf(product.category?.slug ?? '');
  if (!kind) return null;
  const vars = (product.product_variations ?? []).filter((v) => v.active !== false);
  if (!vars.length) return null;
  const brand = product.brand?.name;
  const existing = product.characteristics ?? [];
  const has = (name) => existing.some((c) => c.name.trim().toLowerCase() === name.toLowerCase());
  const chars = [];
  const add = (name, value) => { if (value && !has(name) && !chars.some((c) => c.name === name)) chars.push({ name, value }); };
  const collection = existing.find((c) => /^колекц/i.test(c.name))?.value;
  const floor = ['laminate', 'spc', 'lvt'].includes(kind);

  add('Бренд', !has('Виробник') ? brand : null);
  const types = uniq(values(vars, (v) => v.decor?.name).map(coating));
  let text = '';
  let short = '';

  if (floor) {
    const cls = values(vars, spec('Клас зносостійкості')).sort(byNumber);
    const thick = values(vars, spec('Товщина')).map(num).sort(byNumber);
    const sizes = values(vars, (v) => v.boardSize);
    const areas = values(vars, (v) => v.packArea).map(num).sort(byNumber);
    const planks = values(vars, spec('Планок у пачці')).sort(byNumber);
    const bevels = uniq(values(vars, spec('Фаска')).map(bevel));
    const locks = uniq(values(vars, spec('Замок')).map(lock));
    const glue = values(vars, spec('Замок')).some((v) => /^клей/i.test(v)) || kind === 'lvt';
    const material = values(vars, spec('Матеріал'));
    const wear = uniq(values(vars, spec('Захисний шар')).map((v) => `${num(v.replace(/\s*(mm|мм)\s*$/i, ''))} мм`));
    const water = values(vars, spec('Вологостійкий')).some((v) => /^так$/i.test(v));
    const typeName = { laminate: 'Ламінат', spc: 'Вінілова підлога SPC (замкова)', lvt: 'Вінілова підлога LVT (клейова)' }[kind];

    add('Тип покриття', typeName);
    add('Матеріал основи', list(material, 3));
    add('Клас зносостійкості', list(cls, 3));
    add('Товщина', thick.length && thick.length <= 3 ? `${thick.join(' / ')} мм` : null);
    add('Захисний шар', list(wear, 2));
    add('Розмір дошки', sizes.length && sizes.length <= 3 ? `${sizes.map(num).join('; ')} мм` : null);
    add('Площа в упаковці', areas.length && areas.length <= 3 ? `${areas.join(' / ')} м²` : null);
    add('Дощок в упаковці', planks.length && planks.length <= 3 ? `${planks.join(' / ')} шт.` : null);
    add('Фаска', list(bevels, 2));
    add('Монтаж', glue ? 'клейовий' : 'замковий (плаваюча укладка)');
    add('Замок', glue ? null : list(locks, 2));
    add('Вологостійкість', water ? 'так' : null);

    const what = { laminate: 'ламінат', spc: 'замкова вінілова підлога SPC', lvt: 'клейова вінілова підлога LVT' }[kind];
    const specs = [
      cls.length === 1 ? `${cls[0]} клас зносостійкості` : cls.length ? `${cls.join(' / ')} клас зносостійкості` : null,
      thick.length && thick.length <= 3 ? `товщина ${thick.join(' / ')} мм` : null,
      sizes.length === 1 ? `дошка ${num(sizes[0])} мм` : null,
    ].filter(Boolean);
    const first = `${product.name} — ${what}${brand ? ` ${brand}` : ''}${collection ? `, колекція ${collection}` : ''}.`;
    const shown = cls.length === 1 && CLASS_TEXT[cls[0]] ? specs.slice(1) : specs;
    const parts = [first + (shown.length ? ` ${shown.join(', ').replace(/^./, (c) => c.toUpperCase())}.` : '')];
    if (cls.length === 1 && CLASS_TEXT[cls[0]]) parts[0] += ` ${CLASS_TEXT[cls[0]]}`;
    const extra = [];
    if (kind === 'spc') extra.push('Жорстка кам\'яно-полімерна основа не боїться води й не розбухає, тому підлогу можна класти на кухні, у передпокої та ванній.');
    if (kind === 'lvt') extra.push('Тонкі гнучкі планки клеять на рівну підготовлену основу; вінілова поверхня не боїться води.');
    if (kind === 'laminate' && water) extra.push('Вологостійке виконання краще переносить вологе прибирання й підходить для кухні та передпокою.');
    if (bevels.length === 1 && /4/.test(bevels[0])) extra.push('Фаска з чотирьох сторін підкреслює кожну дошку, як у масивної підлоги.');
    if (!glue && locks.length === 1) extra.push(`Замок ${locks[0]} — укладка без клею, плаваючим способом.`);
    if (extra.length) parts.push(extra.join(' '));
    parts.push('Ціна вказана за м², продаємо цілими упаковками: вкажіть площу — калькулятор порахує кількість упаковок. '
      + 'На підрізку радимо додати 5–10 % (для укладки «ялинкою» чи по діагоналі — більше). Колір оберіть вище; '
      + 'якщо сумніваєтесь, приходьте до магазину подивитися зразки наживо.');
    text = parts.join('\n\n');
    short = `${what.charAt(0).toUpperCase() + what.slice(1)}${brand ? ` ${brand}` : ''}${specs.length ? `, ${specs.slice(0, 2).join(', ')}` : ''}.`;
  } else {
    const glass = values(vars, (v) => v.decor_glass?.name);
    const widths = values(vars, (v) => v.width).sort(byNumber);
    const heights = values(vars, (v) => v.height).sort(byNumber);
    const sides = values(vars, option('Сторона відкривання')).sort();
    const edges = values(vars, option('Кромка'));
    const subclass = existing.find((c) => /^конструкц/i.test(c.name))?.value ?? construction(product);

    if (kind === 'interior') {
      add('Тип покриття', list(types, 6));
      add('Конструкція', subclass ?? null);
      add('Скління', glass.length && glass.length <= 8 ? glass.join('; ') : null);
      add('Кромка', edges.length && edges.length <= 4 ? edges.join('; ') : null);
      if (!has('Стандартна ширина полотна') && !has('Стандартна ширина')) add('Ширина полотна', widths.length ? `${widths.join(', ')} мм` : null);
      if (!has('Стандартна висота полотна') && !has('Висота полотна')) add('Висота полотна', heights.length ? `${heights.join(', ')} мм` : null);
    } else {
      add('Розміри', widths.length && heights.length ? uniq(vars.map((v) => {
        return v.width && v.height ? `${v.width}×${v.height}` : null;
      })).sort(byNumber).join(', ') + ' мм' : null);
      add('Сторона відкривання', sides.length ? sides.map(lower).join(' / ') : null);
      add('Оздоблення (зовні / всередині)', list(types.map((t) => t.replace('/', ' / ')), 4));
      add('Скління', list(glass, 3));
    }

    const colours = uniq(vars.map((v) => v.decor_color?.name));
    if (kind === 'interior') {
      const what = `міжкімнатні двері${brand ? ` ${brand}` : ''}${collection ? `, колекція ${collection}` : ''}`;
      const construction = !/^(збірн|каркасн)/i.test(subclass ?? '') ? '' : /конструкц/i.test(subclass) ? ` ${lower(subclass)}` : ` ${lower(subclass).replace(/і$/, 'ої')} конструкції`;
      const p1 = [`${product.name} — ${what}.`];
      if (types.length) p1.push(`Полотно${construction} з покриттям ${types.join(', ')}.`);
      else if (construction) p1.push(`Полотно${construction}.`);
      if (glass.length === 1 && /^глухе$/i.test(glass[0])) p1.push('Глухе полотно, без скла.');
      else if (glass.length && glass.length <= 4) p1.push(`Скління: ${glass.map(lower).join('; ')}.`);
      else if (glass.length) p1.push('Є кілька варіантів скління й оздоблення: їх показано вище.');
      text = [p1.join(' '),
        'Оберіть колір, скло й розмір полотна вище. Коробку, лиштву, добори та фурнітуру можна додати до замовлення; '
        + 'якщо не знаєте, який розмір потрібен, зателефонуйте: підкажемо, як виміряти дверний проріз.'].join('\n\n');
      short = `Міжкімнатні двері${brand ? ` ${brand}` : ''}${types.length && types.length <= 2 ? `, покриття ${types.join(' / ')}` : ''}.`;
    } else {
      const where = kind === 'street' ? 'вхідні двері для приватного будинку' : 'вхідні двері в квартиру';
      const p1 = [`${product.name} — ${where}${brand ? ` ${brand}` : ''}.`];
      if (types.length) p1.push(`Оздоблення зовні / всередині: ${types.map((t) => t.replace('/', ' / ')).join('; ')}.`);
      if (colours.length && colours.length <= 3) p1.push(`Покриття: ${colours.join('; ')}.`);
      if (glass.some((g) => /склопакет/i.test(g))) p1.push('Є виконання зі склопакетом.');
      const sizes = chars.find((c) => c.name === 'Розміри')?.value;
      text = [p1.join(' '),
        `${sizes ? `Розміри: ${sizes}; ` : ''}сторону відкривання (ліва чи права) обирайте, стоячи перед дверима ззовні. `
        + 'Не впевнені в розмірі прорізу чи стороні — зателефонуйте, підкажемо.'].join('\n\n');
      short = `${where.charAt(0).toUpperCase() + where.slice(1)}${brand ? ` ${brand}` : ''}${types.length === 1 ? `, ${types[0]}` : ''}.`;
    }
  }

  return {
    documentId: product.documentId,
    name: product.name,
    category: product.category.slug,
    addCharacteristics: chars,
    description: product.description?.trim() ? null : text,
    shortDescription: product.shortDescription?.trim() ? null : short,
  };
}

/** Local CMS through the documents API. */
function localStore(strapi) {
  return {
    name: 'local',
    async list() {
      const products = [];
      for (let start = 0; ; start += 100) {
        const page = await strapi.documents(PRODUCT).findMany({
          status: 'published', start, limit: 100,
          populate: { category: { fields: ['slug', 'name'], populate: { parent: { fields: ['slug'] } } }, brand: { fields: ['name'] },
            characteristics: true, product_variations: { fields: ['active', 'width', 'height', 'packArea', 'boardSize'],
              populate: { decor: { fields: ['name'] }, decor_color: { fields: ['name'] }, decor_glass: { fields: ['name'] },
                options: true, characteristics: true } } },
        });
        products.push(...page);
        if (page.length < 100) break;
      }
      return products;
    },
    async save(documentId, data) {
      await strapi.documents(PRODUCT).update({ documentId, data });
      await strapi.documents(PRODUCT).publish({ documentId });
    },
  };
}

/** Another CMS (the server) through REST with an API token: STRAPI_URL, STRAPI_TOKEN. */
function remoteStore(url, token) {
  const call = async (method, route, body) => {
    const response = await fetch(`${url.replace(/\/$/, '')}/${route}`, {
      method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) throw new Error(`${method} ${route.split('?')[0]}: HTTP ${response.status} ${json?.error?.message ?? ''}`);
    return json;
  };
  return {
    name: url,
    async list() {
      const products = [];
      const v = 'populate[product_variations]';
      const query = 'status=published&pagination[pageSize]=100&populate[category][fields][0]=slug&populate[category][fields][1]=name'
        + '&populate[category][populate][parent][fields][0]=slug&populate[brand][fields][0]=name&populate[characteristics]=true'
        + ['active', 'width', 'height', 'packArea', 'boardSize'].map((f, i) => `&${v}[fields][${i}]=${f}`).join('')
        + ['decor', 'decor_color', 'decor_glass'].map((r) => `&${v}[populate][${r}][fields][0]=name`).join('')
        + `&${v}[populate][options]=true&${v}[populate][characteristics]=true`;
      for (let page = 1; ; page++) {
        const body = await call('GET', `api/products?${query}&pagination[page]=${page}`);
        products.push(...body.data);
        if (page >= body.meta.pagination.pageCount) break;
      }
      return products;
    },
    async save(documentId, data) { await call('PUT', `api/products/${documentId}?status=published`, { data }); },
  };
}

async function main(store) {
  const products = await store.list();
  const plans = products.filter((p) => p.active !== false).map(plan)
    .filter((p) => p && (p.addCharacteristics.length || p.description || p.shortDescription));
  console.log(`${products.length} products, ${plans.length} to fill: `
    + `${plans.filter((p) => p.description).length} descriptions, ${plans.filter((p) => p.shortDescription).length} short, `
    + `${plans.reduce((n, p) => n + p.addCharacteristics.length, 0)} characteristics`);
  if (PREVIEW) fs.writeFileSync(PREVIEW, JSON.stringify(plans, null, 1));
  if (!APPLY) return;

  const journal = path.join(process.cwd(), `.tmp/fill-product-info-${REMOTE ? 'remote-' : ''}${Date.now()}.jsonl`);
  for (const item of plans) {
    const product = products.find((p) => p.documentId === item.documentId);
    const data = {};
    if (item.addCharacteristics.length) data.characteristics = [
      ...product.characteristics.map(({ name, value, unit }) => ({ name, value, unit })),
      ...item.addCharacteristics,
    ];
    if (item.description) data.description = item.description;
    if (item.shortDescription) data.shortDescription = item.shortDescription;
    await store.save(item.documentId, data);
    fs.appendFileSync(journal, JSON.stringify({ documentId: item.documentId, before: {
      description: product.description ?? null, shortDescription: product.shortDescription ?? null,
      characteristics: product.characteristics.map(({ name, value, unit }) => ({ name, value, unit })) } }) + '\n');
  }
  console.log(`Applied ${plans.length}; journal ${journal}`);
}

(async () => {
  if (REMOTE) {
    if (!process.env.STRAPI_URL || !process.env.STRAPI_TOKEN) throw new Error('--remote needs STRAPI_URL and STRAPI_TOKEN');
    return main(remoteStore(process.env.STRAPI_URL, process.env.STRAPI_TOKEN)).catch((error) => { console.error('ERROR:', error.message); process.exitCode = 1; });
  }
  const options = fs.existsSync('src') ? await compileStrapi() : { appDir: process.cwd(), distDir: path.join(process.cwd(), 'dist') };
  const strapi = await createStrapi(options).load();
  try { await main(localStore(strapi)); }
  catch (error) { console.error('ERROR:', error.message); process.exitCode = 1; }
  finally { await strapi.destroy(); }
})();
