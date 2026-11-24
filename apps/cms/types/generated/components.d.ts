import type { Schema, Struct } from '@strapi/strapi';

export interface AboutCard extends Struct.ComponentSchema {
  collectionName: 'components_about_cards';
  info: {
    description: '\u041F\u043E\u0440\u043E\u0436\u043D\u0454 \u0444\u043E\u0442\u043E \u2014 \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u0435 \u0444\u043E\u0442\u043E \u0441\u0430\u0439\u0442\u0443';
    displayName: '\u041A\u0430\u0440\u0442\u043A\u0430 \u0437 \u0444\u043E\u0442\u043E \u0439 \u043F\u043E\u0441\u0438\u043B\u0430\u043D\u043D\u044F\u043C';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    imageAlt: Schema.Attribute.String;
    linkLabel: Schema.Attribute.String;
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

export interface AboutHighlight extends Struct.ComponentSchema {
  collectionName: 'components_about_highlights';
  info: {
    description: '\u0420\u044F\u0434\u043E\u043A \u043F\u0456\u0434 \u0433\u043E\u043B\u043E\u0432\u043D\u0438\u043C \u0444\u043E\u0442\u043E \u0441\u0442\u043E\u0440\u0456\u043D\u043A\u0438 \u00AB\u041F\u0440\u043E \u043D\u0430\u0441\u00BB';
    displayName: '\u041F\u0435\u0440\u0435\u0432\u0430\u0433\u0430 (\u0456\u043A\u043E\u043D\u043A\u0430 \u0439 \u0442\u0435\u043A\u0441\u0442)';
  };
  attributes: {
    icon: Schema.Attribute.Enumeration<
      [
        'store',
        'badge-check',
        'settings',
        'truck',
        'calculator',
        'clock',
        'map-pin',
        'phone',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'store'>;
    text: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AboutStep extends Struct.ComponentSchema {
  collectionName: 'components_about_steps';
  info: {
    displayName: '\u041A\u0440\u043E\u043A';
  };
  attributes: {
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CatalogCharacteristic extends Struct.ComponentSchema {
  collectionName: 'components_catalog_characteristics';
  info: {
    displayName: '\u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0430';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    unit: Schema.Attribute.String;
    value: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface CatalogSizeNote extends Struct.ComponentSchema {
  collectionName: 'components_catalog_size_notes';
  info: {
    description: '\u041F\u043E\u043A\u0430\u0437\u0443\u0454\u0442\u044C\u0441\u044F \u043D\u0430 \u0441\u0430\u0439\u0442\u0456, \u043A\u043E\u043B\u0438 \u0432\u0438\u0431\u0440\u0430\u043D\u043E \u0446\u0435\u0439 \u0440\u043E\u0437\u043C\u0456\u0440 (\u043D\u0430\u043F\u0440. \u0448\u0438\u0440\u0438\u043D\u0430 400: \u00AB\u0432\u0438\u0433\u043E\u0442\u043E\u0432\u043B\u044F\u0454\u0442\u044C\u0441\u044F \u0433\u043B\u0443\u0445\u0438\u043C\u00BB)';
    displayName: '\u041F\u0440\u0438\u043C\u0456\u0442\u043A\u0430 \u0434\u043E \u0440\u043E\u0437\u043C\u0456\u0440\u0443';
  };
  attributes: {
    dimension: Schema.Attribute.Enumeration<['width', 'height']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'width'>;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
    value: Schema.Attribute.Integer & Schema.Attribute.Required;
  };
}

export interface CatalogSizeRule extends Struct.ComponentSchema {
  collectionName: 'components_catalog_size_rules';
  info: {
    description: '\u0414\u0456\u0430\u043F\u0430\u0437\u043E\u043D \u043D\u0435\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u043E\u0433\u043E \u0440\u043E\u0437\u043C\u0456\u0440\u0443: \u0432\u0456\u0434 min \u0434\u043E max \u0437 \u043A\u0440\u043E\u043A\u043E\u043C step, \u043D\u0430\u0446\u0456\u043D\u043A\u0430 percent % \u0434\u043E \u0446\u0456\u043D\u0438 \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u043E\u0433\u043E \u0440\u043E\u0437\u043C\u0456\u0440\u0443. decors: \u043B\u0438\u0448\u0435 \u0434\u043B\u044F \u0446\u0438\u0445 \u0434\u0435\u043A\u043E\u0440\u0456\u0432 \u0430\u0431\u043E \u043A\u043E\u043B\u044C\u043E\u0440\u0456\u0432 (\u043D\u0430\u0437\u0432\u0438 \u0447\u0435\u0440\u0435\u0437 \u043A\u043E\u043C\u0443), \u043F\u043E\u0440\u043E\u0436\u043D\u044C\u043E = \u0434\u043B\u044F \u0432\u0441\u0456\u0445';
    displayName: '\u041D\u0435\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u0438\u0439 \u0440\u043E\u0437\u043C\u0456\u0440';
  };
  attributes: {
    decors: Schema.Attribute.Text;
    dimension: Schema.Attribute.Enumeration<['height', 'width']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'height'>;
    max: Schema.Attribute.Integer & Schema.Attribute.Required;
    min: Schema.Attribute.Integer & Schema.Attribute.Required;
    percent: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<15>;
    step: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<10>;
  };
}

export interface CatalogVariationOption extends Struct.ComponentSchema {
  collectionName: 'components_catalog_variation_options';
  info: {
    displayName: '\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440 \u0432\u0438\u0431\u043E\u0440\u0443';
  };
  attributes: {
    changesLook: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeHeroSlide extends Struct.ComponentSchema {
  collectionName: 'components_home_hero_slides';
  info: {
    description: 'Additional rich hero banners. Reorder these slides; the permanent shop map always stays first. Kind "image": only the picture (no overlay or text), the whole banner links to buttonUrl; title is used as the image description.';
    displayName: '\u0421\u043B\u0430\u0439\u0434 \u0431\u0430\u043D\u0435\u0440\u0430';
  };
  attributes: {
    alignment: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    badge: Schema.Attribute.String;
    body: Schema.Attribute.Blocks;
    buttonLabel: Schema.Attribute.String;
    buttonUrl: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    eyebrow: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    imageAlt: Schema.Attribute.String;
    kind: Schema.Attribute.Enumeration<['promotion', 'map', 'image']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'promotion'>;
    mapEmbedUrl: Schema.Attribute.Text;
    mapTitle: Schema.Attribute.String;
    mobileDescription: Schema.Attribute.Text;
    mobileImage: Schema.Attribute.Media<'images'>;
    secondaryButtonLabel: Schema.Attribute.String;
    secondaryButtonUrl: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomePromoTicker extends Struct.ComponentSchema {
  collectionName: 'components_home_promo_tickers';
  info: {
    description: '\u0427\u0435\u0440\u0432\u043E\u043D\u0430 \u0431\u0456\u0433\u0443\u0447\u0430 \u043F\u043B\u0430\u0448\u043A\u0430 \u043F\u0456\u0434 \u0431\u0430\u043D\u0435\u0440\u043E\u043C \u0433\u043E\u043B\u043E\u0432\u043D\u043E\u0457. \u0412\u0438\u043C\u043A\u043D\u0435\u043D\u043E \u0430\u0431\u043E \u043F\u043E\u0440\u043E\u0436\u043D\u0456\u0439 \u0442\u0435\u043A\u0441\u0442 \u2014 \u043F\u043B\u0430\u0448\u043A\u0438 \u043D\u0435\u043C\u0430\u0454. \u041F\u0440\u0438\u043A\u043B\u0430\u0434: \u043C\u0456\u0442\u043A\u0430 \u00AB\u0410\u043A\u0446\u0456\u044F\u00BB, \u0432\u0438\u0434\u0456\u043B\u0435\u043D\u0435 \u00AB\u221225%\u00BB, \u0442\u0435\u043A\u0441\u0442 \u00AB\u043D\u0430 \u043B\u0430\u043C\u0456\u043D\u0430\u0442 Kronospan\u00BB, \u043F\u0440\u0438\u043C\u0456\u0442\u043A\u0430 \u00AB\u0422\u0456\u043B\u044C\u043A\u0438 \u0434\u043E \u043A\u0456\u043D\u0446\u044F \u043C\u0456\u0441\u044F\u0446\u044F\u00BB.';
    displayName: '\u041F\u043B\u0430\u0448\u043A\u0430 \u0430\u043A\u0446\u0456\u0457';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    highlight: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }> &
      Schema.Attribute.DefaultTo<'\u0410\u043A\u0446\u0456\u044F'>;
    note: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    text: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    url: Schema.Attribute.String;
  };
}

export interface SharedOpenGraph extends Struct.ComponentSchema {
  collectionName: 'components_shared_open_graphs';
  info: {
    displayName: '\u0421\u043E\u0446\u043C\u0435\u0440\u0435\u0436\u0456 (Open Graph)';
    icon: 'project-diagram';
  };
  attributes: {
    ogDescription: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    ogType: Schema.Attribute.String;
    ogUrl: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '\u0420\u0443\u0447\u043D\u0456 SEO-\u043F\u0440\u0430\u0432\u043A\u0438. \u041F\u043E\u0440\u043E\u0436\u043D\u0456 \u043F\u043E\u043B\u044F \u0441\u0430\u0439\u0442 \u0437\u0430\u043F\u043E\u0432\u043D\u044E\u0454 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u043E \u0437 \u043D\u0430\u0437\u0432\u0438, \u0446\u0456\u043D\u0438 \u0439 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A.';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaRobots: Schema.Attribute.String;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaViewport: Schema.Attribute.String;
    openGraph: Schema.Attribute.Component<'shared.open-graph', false>;
    structuredData: Schema.Attribute.JSON;
  };
}

export interface ShopsLocation extends Struct.ComponentSchema {
  collectionName: 'components_shops_locations';
  info: {
    description: '\u041F\u043E\u043A\u0430\u0437\u0443\u0454\u0442\u044C\u0441\u044F \u043D\u0430 \u043A\u0430\u0440\u0442\u0456, \u0443 \u0441\u043F\u0438\u0441\u043A\u0443 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0456\u0432 \u043D\u0430 \u0433\u043E\u043B\u043E\u0432\u043D\u0456\u0439 \u0456 \u0432 \u00AB\u041F\u0440\u043E \u043D\u0430\u0441\u00BB, \u0443 \u0441\u0430\u043C\u043E\u0432\u0438\u0432\u043E\u0437\u0456';
    displayName: '\u041C\u0430\u0433\u0430\u0437\u0438\u043D';
  };
  attributes: {
    address: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    hours: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    lat: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 90;
          min: -90;
        },
        number
      >;
    lng: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 180;
          min: -180;
        },
        number
      >;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    phone: Schema.Attribute.String;
    placeId: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'about.card': AboutCard;
      'about.highlight': AboutHighlight;
      'about.step': AboutStep;
      'catalog.characteristic': CatalogCharacteristic;
      'catalog.size-note': CatalogSizeNote;
      'catalog.size-rule': CatalogSizeRule;
      'catalog.variation-option': CatalogVariationOption;
      'home.hero-slide': HomeHeroSlide;
      'home.promo-ticker': HomePromoTicker;
      'shared.open-graph': SharedOpenGraph;
      'shared.seo': SharedSeo;
      'shops.location': ShopsLocation;
    }
  }
}
