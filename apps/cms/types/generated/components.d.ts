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
    description: 'Additional rich hero banners. Reorder these slides; the permanent shop map always stays first.';
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
    kind: Schema.Attribute.Enumeration<['promotion', 'map']> &
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
      'door-config.door-interior': DoorConfigDoorInterior;
      'home.hero-map': HomeHeroMap;
      'home.hero-slide': HomeHeroSlide;
      'shops.adresses': ShopsAdresses;
      'shops.location': ShopsLocation;
    }
  }
}
