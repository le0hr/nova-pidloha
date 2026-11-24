import type { SizeNote, SizeRule } from "@/lib/catalog/sizing";

export interface ProductAddon {
  id: string;
  name: string;
  group: string | null;
  /** Price of one piece. */
  price: number;
  /** Pieces ordered (moulding: 1, 2.5 or 5; skirting: any whole number). Missing = 1. */
  qty?: number;
}

export interface ProductVariation {
  addons?: ProductAddon[];
  active?: boolean;
  /** Selection steps besides decor/colour/glass/size, in step order (construction, edge, side…). */
  options?: { name: string; value: string; changesLook?: boolean | null }[] | null;
  /** Standard door size of this variation, mm. */
  width?: number | null;
  height?: number | null;
  /** Floor sold by whole packs of this many m²; null = by the piece. */
  packArea?: number | null;
  boardSize?: string | null;
  availability?: "in_stock" | "on_order" | null;
  name: string;
  slug: string;
  decor: { name: string } | null;
  /** `image`: swatch photo of the colour (a crop of the decor), absolute URL. */
  decor_color: { name: string; image?: string | null } | null;
  decor_glass: { name: string } | null;
  price: number;
  image: string;
  /** Shown under the photo, e.g. "no exact photo of this variation". */
  note?: string | null;
}

export interface ProductReturnData {
  addons?: ProductAddon[];
  name: string
  slug: string;
  brand?: string;
  updatedAt?: string;
  /** Main product photo (variations have their own). */
  image?: string;
  description: string;
  /** One-line summary for meta tags: the short description, else the start of the full one. */
  summary: string;
  characteristics: {
    name: string;
    value: string;
    unit: string | null;
  }[];
  category: {name: string, slug: string} | null;
  /** Non-standard size rules (product's own, else the brand's); empty = standard sizes only. */
  sizeRules: SizeRule[];
  /** Catalog notes per size (width 400: "made solid"…). */
  sizeNotes: SizeNote[];
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