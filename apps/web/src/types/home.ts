export interface HomeProduct {
  name: string;
  href: string;
  image: string;
  price: number | null;
  badge?: string;
}

export interface HeroBlock {
  type: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  url?: string;
  format?: string;
  children?: HeroBlock[];
}

export interface HeroSlide {
  body?: HeroBlock[];
  badge?: string;
  mobileImage?: string;
  alignment?: "left" | "center" | "right";
  kind: "promotion" | "map";
  title: string;
  eyebrow?: string;
  description?: string;
  mobileDescription?: string;
  image?: string;
  imageAlt?: string;
  label?: string;
  href?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  mapEmbedUrl?: string;
  mapTitle?: string;
}
