import type { Schema, Struct } from '@strapi/strapi';

export interface CatalogCharacteristic extends Struct.ComponentSchema {
  collectionName: 'components_catalog_characteristics';
  info: {
    displayName: 'Characteristic';
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

export interface DoorConfigDoorInterior extends Struct.ComponentSchema {
  collectionName: 'components_door_config_door_interiors';
  info: {
    displayName: 'DoorInterior';
  };
  attributes: {
    architrave_type: Schema.Attribute.Relation<
      'oneToOne',
      'api::architrave-type.architrave-type'
    >;
    decor: Schema.Attribute.Relation<'oneToOne', 'api::decor.decor'>;
    decor_glass: Schema.Attribute.Relation<
      'oneToOne',
      'api::decor-glass.decor-glass'
    >;
  };
}

export interface HomeHeroMap extends Struct.ComponentSchema {
  collectionName: 'components_home_hero_maps';
  info: {
    description: 'Permanent banner showing both configured shop locations. Edit its text and optional action button here.';
    displayName: 'Permanent shop map';
  };
  attributes: {
    buttonLabel: Schema.Attribute.String;
    buttonUrl: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface HomeHeroSlide extends Struct.ComponentSchema {
  collectionName: 'components_home_hero_slides';
  info: {
    description: 'Additional rich hero banners. Reorder these slides; the permanent shop map always stays first. Kind "image": only the picture (no overlay or text), the whole banner links to buttonUrl; title is used as the image description.';
    displayName: 'Hero slide';
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

export interface ShopsAdresses extends Struct.ComponentSchema {
  collectionName: 'components_shops_adresses';
  info: {
    displayName: 'adresses';
  };
  attributes: {
    adress: Schema.Attribute.String;
    Schedule: Schema.Attribute.Blocks;
  };
}

export interface ShopsLocation extends Struct.ComponentSchema {
  collectionName: 'components_shops_locations';
  info: {
    displayName: '\u041C\u0430\u0433\u0430\u0437\u0438\u043D \u043D\u0430 \u043A\u0430\u0440\u0442\u0456';
  };
  attributes: {
    address: Schema.Attribute.String;
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
      'catalog.characteristic': CatalogCharacteristic;
      'catalog.size-note': CatalogSizeNote;
      'catalog.size-rule': CatalogSizeRule;
      'door-config.door-interior': DoorConfigDoorInterior;
      'home.hero-map': HomeHeroMap;
      'home.hero-slide': HomeHeroSlide;
      'shops.adresses': ShopsAdresses;
      'shops.location': ShopsLocation;
    }
  }
}
