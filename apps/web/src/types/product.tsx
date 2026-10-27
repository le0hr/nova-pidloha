export interface ProductAddon {
  id: string;
  name: string;
  group: string | null;
  price: number;
}

export interface ProductVariation {
  addons?: ProductAddon[];
  active?: boolean;
  oldPrice?: number;
  catalog_attributes?: Record<string, string | number | boolean> | null;
  attribute_definitions?: { key: string; display_name: string }[] | null;
  name: string;
  slug: string;
  decor: { name: string } | null;
  decor_color: { name: string } | null;
  decor_glass: { name: string } | null;
  price: number;
  image: string;
}

export interface ProductReturnData {
  addons?: ProductAddon[];
  name: string
  description: string;
  characteristics: {
    name: string;
    value: string;
    unit: string | null;
  }[];
  category: {name: string, slug: string};
  variations: ProductVariation[];
}

export type SizeMode = "standard" | "custom";

export interface VariationState {
  decor: string;
  decor_color: string;
  decor_glass: string;
  sizeMode: SizeMode;
  width: number;
  height: number;
  image: string
}