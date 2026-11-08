type FilterOption = {
  id: number;
  label: string;
  value: string;
  color?: string;
};

type FilterGroup = {
  id: number;
  name: string;
  slug: string;
  type: "checkbox" | "color" | "range";
  options?: FilterOption[];
};

export interface CatalogProduct {
  name: string;
  price: number;
  images: string[];
  slug: string;
  /** Price unit, e.g. "м²" for floor coverings. */
  unit?: string;
  /** Square photo (floor) instead of the tall door photo. */
  square?: boolean;
  /** Short product description from the CMS. */
  description?: string;
  /** "isNew" flag from the CMS: shows the NEW badge. */
  isNew?: boolean;
}