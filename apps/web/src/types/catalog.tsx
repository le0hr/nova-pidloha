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
}