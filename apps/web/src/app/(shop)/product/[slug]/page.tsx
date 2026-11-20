import { notFound } from "next/navigation";
import DynamicField from "./ProductInteractive";
import { getProductBySlug } from "@/lib/services/product.service";
import Breadcrumb from "@/components/layout/shop/Breadcrumps";
import ProductTabsClient from "@/components/product/ProductTabs";
import CharacteristicsTable from "@/components/product/CharacteristicsTable";
import JsonLd from "@/components/seo/JsonLd";
import { priceUnit } from "@/lib/catalog/floor";
import { categoryHref } from "@/lib/catalog/categories";
import {
  SEO_FIELDS, absoluteUrl, breadcrumbLd, clip, cmsStructuredData, fetchSeo, formatUah, pageMetadata, plainText, siteUrl,
} from "@/lib/seo";
import type { ProductReturnData } from "@/types/product";
import type { Metadata } from "next";
import { cache } from "react";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const productSeo = cache((slug: string) => fetchSeo(
  `query ProductSeo($slug: String!) { products(filters: {slug: {eq: $slug}}) { ${SEO_FIELDS} } }`,
  { slug }, data => data.products?.[0]?.seo,
));

const productPath = (slug: string) => `/product/${encodeURIComponent(slug)}`;
const prices = (product: ProductReturnData) => product.variations.map(v => v.price).filter(price => price > 0);
const images = (product: ProductReturnData) =>
  [...new Set([product.image, ...product.variations.map(v => v.image)].filter((url): url is string => !!url))];

/** Automatic description: price, short description or key characteristics, where to buy. */
function autoDescription(product: ProductReturnData): string {
  const list = prices(product);
  const unit = priceUnit(product.category?.slug) ? "/м²" : "";
  const about = plainText(product.description) || product.characteristics.slice(0, 4)
    .map(({ name, value, unit }) => `${name}: ${[value, unit].filter(Boolean).join(" ")}`).join(", ");
  return [
    `${product.name}${product.brand && !product.name.includes(product.brand) ? ` від ${product.brand}` : ""}${list.length ? ` — ціна від ${formatUah(Math.min(...list))}${unit}` : ""}`,
    clip(about, 90),
    "Купити у Черкасах, доставка по Україні",
  ].map(part => part.replace(/[\s.]+$/, "")).filter(Boolean).join(". ");
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const [product, seo] = await Promise.all([getProductBySlug(slug), productSeo(slug)]);
  if (!product?.variations?.length) return { title: "Товар не знайдено", robots: { index: false } };
  return pageMetadata({
    title: `${product.name} — купити в Черкасах`,
    description: autoDescription(product),
    path: productPath(slug),
    image: images(product)[0],
    imageAlt: product.name,
  }, seo);
}

/** schema.org Product: price shows in Google results. Floor coverings are priced per m² (unit code MTK). */
function productLd(product: ProductReturnData) {
  const url = absoluteUrl(productPath(product.slug));
  const list = prices(product);
  const perM2 = Boolean(priceUnit(product.category?.slug));
  const base = { priceCurrency: "UAH", url, itemCondition: "https://schema.org/NewCondition", seller: { "@id": `${siteUrl()}/#organization` } };
  const offers = !list.length ? undefined
    : perM2 ? { "@type": "Offer", ...base, price: Math.min(...list),
      priceSpecification: { "@type": "UnitPriceSpecification", price: Math.min(...list), priceCurrency: "UAH", unitCode: "MTK", unitText: "м²" } }
    : Math.min(...list) === Math.max(...list) ? { "@type": "Offer", ...base, price: list[0] }
    : { "@type": "AggregateOffer", ...base, lowPrice: Math.min(...list), highPrice: Math.max(...list), offerCount: list.length };
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url,
    description: clip(autoDescription(product), 500),
    image: images(product).slice(0, 10),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.category ? { category: product.category.name } : {}),
    ...(product.characteristics.length ? { additionalProperty: product.characteristics.slice(0, 20).map(({ name, value, unit }) => ({
      "@type": "PropertyValue", name, value: [value, unit].filter(Boolean).join(" "),
    })) } : {}),
    ...(offers ? { offers } : {}),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const slug = (await params).slug;
  const [product, seo] = await Promise.all([getProductBySlug(slug), productSeo(slug)]);

  if (!product?.variations?.length) {
    return notFound();
  }

  const productName = product.name ?? slug;
  const categoryLabel = product.category?.name ?? "Каталог";
  const characteristics = product.characteristics.map(({ name, value, unit }) => ({
    label: name,
    value: [value, unit].filter(Boolean).join(" "),
  }));
  return (
    <div className="flex flex-col min-h-screen bg-white font-['Outfit',sans-serif]">
      <JsonLd data={[
        productLd(product),
        breadcrumbLd([
          { name: "Головна", path: "/" },
          ...(product.category ? [{ name: product.category.name, path: categoryHref(product.category.slug) }] : []),
          { name: productName },
        ]),
        ...cmsStructuredData(seo),
      ]} />
      <main className="flex-1">
        <Breadcrumb
          items={[
          {
            label: "Головна",
            href: "/",
          },
          {
            label: categoryLabel,
            href: product.category ? `/catalog/${product.category.slug}` : "/",
          },
          {
            label: productName,
          },
        ]}
        />

        {/* Main content */}
        <div className="page-gutter content-container">
          {/* Desktop title */}
          <div className="hidden md:block mb-[20px] animate-fade-up" style={{ animationDelay: "0.12s" }}>
            <h1 className="font-['Outfit',sans-serif] font-bold text-[#1a1a1a] product-title">
              {productName}
            </h1>
            <p className="font-['Outfit',sans-serif] font-medium text-[#9e9e9e] product-category">
              {categoryLabel}
            </p>
          </div>

          {/* Mobile title */}
          <div className="md:hidden mb-4 animate-fade-up" style={{ animationDelay: "0.14s" }}>
            <h1 className="font-['Outfit',sans-serif] font-bold text-[#1a1a1a] text-[24px]">
              {productName}
            </h1>
            <p className="font-['Outfit',sans-serif] font-normal text-[#9e9e9e] text-[13px]">
              {categoryLabel}
            </p>
          </div>

          <DynamicField
            product={product}
          />

          <ProductTabsClient
            description={<div className="whitespace-pre-line">{product.description}</div>}
            characteristics={<CharacteristicsTable data={characteristics} />}
            documents={null}
            reviews={null}
            reviewsCount={8}
          />
        </div>
      </main>
    </div>
  );
}