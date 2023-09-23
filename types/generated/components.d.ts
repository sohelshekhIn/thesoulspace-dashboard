import type { Schema, Attribute } from '@strapi/strapi';

export interface GlobalsButton extends Schema.Component {
  collectionName: 'components_globals_buttons';
  info: {
    displayName: 'Button';
  };
  attributes: {
    Button_Text: Attribute.String;
    Button_Link: Attribute.String;
  };
}

export interface HomepageComponentsBannerComponent extends Schema.Component {
  collectionName: 'components_homepage_components_banner_components';
  info: {
    displayName: 'BannerComponent';
    description: '';
  };
  attributes: {
    Short_Text: Attribute.String;
    Mid_Text: Attribute.String;
    Big_Text: Attribute.String;
    CTA_Button: Attribute.Component<'globals.button'>;
    Description_Title: Attribute.String;
    Description_Text: Attribute.String;
    BannerImage: Attribute.Media;
  };
}

export interface HomepageComponentsBestSellers extends Schema.Component {
  collectionName: 'components_homepage_components_best_sellers';
  info: {
    displayName: 'BestSellers';
    description: '';
  };
  attributes: {
    product: Attribute.Relation<
      'homepage-components.best-sellers',
      'oneToOne',
      'api::product.product'
    >;
    Product_Thumbnail: Attribute.Media;
  };
}

export interface HomepageComponentsPopularCategories extends Schema.Component {
  collectionName: 'components_homepage_components_popular_categories';
  info: {
    displayName: 'PopularCategories';
  };
  attributes: {
    Title: Attribute.String;
    Description: Attribute.String;
    Icon: Attribute.Media;
  };
}

declare module '@strapi/strapi' {
  export module Shared {
    export interface Components {
      'globals.button': GlobalsButton;
      'homepage-components.banner-component': HomepageComponentsBannerComponent;
      'homepage-components.best-sellers': HomepageComponentsBestSellers;
      'homepage-components.popular-categories': HomepageComponentsPopularCategories;
    }
  }
}
