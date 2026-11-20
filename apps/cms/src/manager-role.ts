/**
 * Admin role "Менеджер": products, banners and orders only.
 *
 * - Товари: products and variations — create, edit, publish, delete. Brands, decors, colours, glass, add-ons and
 *   filter values — create and edit (a new product often needs a new colour or brand), never delete.
 *   Categories — only texts, photo, SEO and "on the home page" (not slug or parent: that would break site URLs).
 *   Filter groups — read only.
 * - Банери: Global → heroEnabled, heroSlides and the promo ticker only (not shops, phone or SEO of the home page).
 * - Замовлення: orders and payment attempts read only; the manager can edit only "Нотатки менеджера".
 * - Media library: browse, upload, edit, download (not delete). SEO plugin sidebar.
 * Importer keys (external_id) are read only. No settings, users, roles, content-type builder or API tokens.
 *
 * The role is defined here and synced on start when ROLE_VERSION changes, so it is the same on every server.
 * Changes made in the admin (Settings → Roles) stay until the next ROLE_VERSION bump overwrites them.
 * Bump ROLE_VERSION after changing the rules below or adding fields to these content types.
 */
const ROLE_CODE = 'nova-manager';
const ROLE_VERSION = 4;
/** Importer keys: visible, never editable (editing one would make the next import create a duplicate). */
const READ_ONLY = ['external_id'];

const CM = 'plugin::content-manager.explorer';
type Rule = { uid: string; actions: string[]; fields?: string[] };

const RULES: Rule[] = [
  { uid: 'api::product.product', actions: ['create', 'read', 'update', 'delete', 'publish'] },
  { uid: 'api::product-variation.product-variation', actions: ['create', 'read', 'update', 'delete', 'publish'] },
  ...['brand.brand', 'decor.decor', 'decor-color.decor-color', 'decor-glass.decor-glass', 'architrave-type.architrave-type', 'filter-code.filter-code']
    .map((name) => ({ uid: `api::${name}`, actions: ['create', 'read', 'update', 'publish'] })),
  { uid: 'api::filter-group.filter-group', actions: ['read'] },
  { uid: 'api::category.category', actions: ['read'] },
  { uid: 'api::category.category', actions: ['update', 'publish'], fields: ['description', 'image', 'isFeatured', 'seo'] },
  { uid: 'api::global.global', actions: ['read', 'update', 'publish'], fields: ['heroEnabled', 'heroSlides', 'promoTicker'] },
  { uid: 'api::order.order', actions: ['read'] },
  { uid: 'api::order.order', actions: ['update'], fields: ['managerNotes'] },
  { uid: 'api::payment-attempt.payment-attempt', actions: ['read'] },
];
const PLUGIN_ACTIONS = [
  'plugin::upload.read', 'plugin::upload.assets.create', 'plugin::upload.assets.update',
  'plugin::upload.assets.download', 'plugin::upload.assets.copy-link',
  'plugin::seo.read',
];

/** Leaf field paths of a content type: components are expanded ("heroSlides.title"), as the admin expects. */
function leafFields(strapi: any, attributes: Record<string, any>, prefix = '', depth = 0): string[] {
  return Object.entries(attributes).flatMap(([name, attribute]) => {
    const path = prefix ? `${prefix}.${name}` : name;
    if (attribute.type === 'component' && depth < 5) {
      const component = strapi.components[attribute.component];
      return component ? leafFields(strapi, component.attributes, path, depth + 1) : [];
    }
    if (attribute.type === 'dynamiczone') return [path];
    // System fields are not permission subjects.
    if (['createdAt', 'updatedAt', 'publishedAt', 'createdBy', 'updatedBy', 'locale', 'localizations', 'documentId'].includes(name) && !prefix) return [];
    return [path];
  });
}

function permissions(strapi: any) {
  const merged = new Map<string, { action: string; subject: string; fields?: Set<string> }>();
  for (const rule of RULES) {
    const model = strapi.contentTypes[rule.uid];
    if (!model) continue;
    const all = leafFields(strapi, model.attributes);
    for (const action of rule.actions) {
      const key = `${action}|${rule.uid}`;
      const entry = merged.get(key) ?? { action: `${CM}.${action}`, subject: rule.uid,
        ...(['create', 'read', 'update'].includes(action) ? { fields: new Set<string>() } : {}) };
      const allowed = rule.fields ? all.filter((path) => rule.fields!.some((f) => path === f || path.startsWith(`${f}.`))) : all;
      for (const field of allowed) if (action === 'read' || !READ_ONLY.includes(field)) entry.fields?.add(field);
      merged.set(key, entry);
    }
  }
  const actions = new Set(strapi.service('admin::permission').actionProvider.values().map((action: any) => action.actionId));
  return [
    ...[...merged.values()].map(({ action, subject, fields }) => ({
      action, subject, properties: fields ? { fields: [...fields] } : {}, conditions: [],
    })),
    // Plugins that are not installed (e.g. SEO) are skipped instead of failing the start.
    ...PLUGIN_ACTIONS.filter((action) => actions.has(action)).map((action) => ({ action, subject: null, properties: {}, conditions: [] })),
  ];
}

export async function syncManagerRole(strapi: any) {
  const marker = strapi.store({ type: 'core', name: 'admin', key: 'manager-role-version' });
  const roles = strapi.service('admin::role');
  let role = await roles.findOne({ code: ROLE_CODE });
  if (role && (await marker.get()) === ROLE_VERSION) return;
  if (!role) {
    role = await roles.create({ name: 'Менеджер', code: ROLE_CODE,
      description: 'Товари, банери на головній, перегляд замовлень. Права задаються в apps/cms/src/manager-role.ts' });
  }
  await roles.assignPermissions(role.id, permissions(strapi));
  await marker.set({ value: ROLE_VERSION });
  strapi.log.info(`Admin role "${role.name}" synced (version ${ROLE_VERSION}).`);
}
