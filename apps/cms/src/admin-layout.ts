/**
 * Order of the fields in the admin forms: what is filled first comes first, related fields share a row, service
 * fields (slug, import key) and SEO are last. A row is "field/width", 12 columns in total.
 * A form is set when its layout here changes; one rearranged by hand in the admin after that stays as it is.
 * Fields missing here are kept at the end of the form.
 */
const LAYOUTS: Record<string, string[]> = {
  'api::product.product': [
    'name/8 active/4', 'category/6 brand/6', 'image/6 price/6',
    'shortDescription/12', 'description/12',
    'product_variations/12', 'characteristics/12',
    'isNew/4 isPromo/4 isSale/4', 'isFeatured/4 filter_values/8',
    'addons/12', 'size_rules/12', 'size_notes/12',
    'slug/6 external_id/6', 'seo/12',
  ],
  'api::product-variation.product-variation': [
    'products/8 active/4',
    'decor/6 decor_color/6', 'decor_glass/6 architrave_types/6', 'image/6 note/6',
    'price/4 availability/4 sku/4',
    'width/6 height/6', 'options/12',
    'packArea/4 boardSize/8', 'characteristics/12',
    'addons/12', 'filter_values/12',
    'supplier_code/4 slug/4 external_id/4',
  ],
  'api::category.category': [
    'name/8 isFeatured/4', 'parent/6 image/6', 'description/12', 'children/6 products/6', 'filter_groups/12',
    'slug/6 external_id/6', 'seo/12',
  ],
  'api::brand.brand': ['name/12', 'size_rules/12', 'products/12', 'slug/6 external_id/6'],
  'api::decor.decor': ['name/12', 'decor_colors/12', 'product_variations/12', 'external_id/12'],
  'api::decor-color.decor-color': ['name/6 decor/6', 'image/12', 'product_variations/12', 'external_id/12'],
  'api::decor-glass.decor-glass': ['name/12', 'product_variations/12', 'external_id/12'],
  'api::architrave-type.architrave-type': ['group/4 name/8', 'additionalCost/6 price/6', 'product_variations/12', 'external_id/12'],
  'api::filter-group.filter-group': ['name/8 type/4', 'categories/12', 'filter_values/12', 'slug/6 external_id/6'],
  'api::filter-code.filter-code': ['name/6 filter_group/6', 'products/12', 'slug/6 external_id/6'],
  'api::global.global': ['phone/6 email/6', 'shopLocations/12', 'heroEnabled/12', 'heroSlides/12', 'promoTicker/12', 'seo/12'],
  'api::about-page.about-page': [
    'heroEyebrow/12', 'heroTitle/6 heroText/6', 'heroImage/6 heroImageAlt/6', 'heroNote/12', 'highlights/12',
    'approachEyebrow/6 approachLead/6', 'approachTitle/6 approachText/6', 'approachLink/12',
    'materialsEyebrow/6 materialsTitle/6', 'materialsText/12', 'materials/12',
    'stepsEyebrow/6 stepsTitle/6', 'stepsText/12', 'steps/12', 'stepsButton/12',
    'closingEyebrow/6 closingTitle/6', 'closingButton/12', 'seo/12',
  ],
  'api::order.order': [
    'number/4 orderStatus/4 paymentStatus/4', 'managerNotes/12',
    'customerName/6 phone/6', 'email/12', 'isCompany/4 companyName/4 edrpou/4',
    'itemsSummary/12', 'totalAmount/6 currency/6', 'comment/12',
    'deliveryMethod/12', 'delivery/12',
    'paymentMethod/4 paymentProvider/4 paymentTestMode/4', 'paymentAttempts/12',
    'checkoutStep/4 submittedAt/4 lastActivityAt/4', 'confirmedAt/6 confirmedBy/6', 'items/12', 'history/12',
  ],
  'api::payment-attempt.payment-attempt': [
    'order/6 providerOrderId/6', 'status/6 providerStatus/6', 'amount/4 currency/4 testMode/4', 'provider/6 action/6',
    'heldAt/4 holdReviewAt/4 paidAt/4', 'checkoutExpiresAt/4 lastCheckedAt/4 reminderSentAt/4', 'errorCode/12',
    'paymentId/4 transactionId/4 publicKey/4', 'events/12',
  ],
  'catalog.characteristic': ['name/4 value/4 unit/4'],
  'catalog.variation-option': ['name/4 value/4 changesLook/4'],
  'catalog.size-rule': ['dimension/4 min/4 max/4', 'step/4 percent/4', 'decors/12'],
  'catalog.size-note': ['dimension/6 value/6', 'text/12'],
  'home.hero-slide': [
    'kind/8 enabled/4', 'eyebrow/6 badge/6', 'title/12', 'description/6 mobileDescription/6', 'body/12',
    'image/6 mobileImage/6', 'imageAlt/6 alignment/6', 'buttonLabel/6 buttonUrl/6',
    'secondaryButtonLabel/6 secondaryButtonUrl/6', 'mapTitle/6 mapEmbedUrl/6',
  ],
  'home.promo-ticker': ['label/8 enabled/4', 'highlight/6 text/6', 'note/6 url/6'],
  'shops.location': ['name/6 address/6', 'phone/6 hours/6', 'lat/6 lng/6', 'image/6 description/6', 'placeId/12'],
  'about.highlight': ['icon/4 title/8', 'text/12'],
  'about.card': ['title/12', 'text/12', 'image/6 imageAlt/6', 'linkLabel/6 url/6'],
  'about.step': ['title/12', 'text/12'],
  'shared.seo': [
    'metaTitle/12', 'metaDescription/12', 'metaImage/12', 'keywords/6 metaRobots/6', 'canonicalURL/6 metaViewport/6',
    'openGraph/12', 'structuredData/12',
  ],
  'shared.open-graph': ['ogTitle/12', 'ogDescription/12', 'ogImage/6 ogUrl/6', 'ogType/12'],
};

type Row = { name: string; size: number }[];
const STORE_KEY = 'nova-admin-layout';

export async function applyAdminLayout(strapi: any) {
  const store = strapi.store({ type: 'plugin', name: 'content-manager', key: STORE_KEY });
  const applied: Record<string, string> = (await store.get()) ?? {};
  for (const [uid, rows] of Object.entries(LAYOUTS)) {
    const isComponent = !uid.startsWith('api::');
    const model = isComponent ? strapi.components[uid] : strapi.contentTypes[uid];
    const wanted = JSON.stringify(rows);
    if (!model || applied[uid] === wanted) continue;
    const service = strapi.plugin('content-manager').service(isComponent ? 'components' : 'content-types');
    const config = await service.findConfiguration(model);
    const current: Row[] = config.layouts?.edit ?? [];
    const known = new Set(current.flat().map((field) => field.name));
    const layout: Row[] = rows.map((row) => row.split(' ').map((field) => {
      const [name, size] = field.split('/');
      return { name, size: Number(size) };
    }).filter((field) => known.has(field.name))).filter((row) => row.length);
    const placed = new Set(layout.flat().map((field) => field.name));
    const rest = current.map((row) => row.filter((field) => !placed.has(field.name))).filter((row) => row.length);
    await service.updateConfiguration(model, { ...config, layouts: { ...config.layouts, edit: [...layout, ...rest] } });
    applied[uid] = wanted;
  }
  await store.set({ value: applied });
}
