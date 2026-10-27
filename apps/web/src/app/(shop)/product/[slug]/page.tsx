import { notFound } from "next/navigation";
import DynamicField from "./ProductInteractive";
import { getProductBySlug } from "@/lib/services/product.service";
import Breadcrumb from "@/components/layout/shop/Breadcrumps";
import ProductTabsClient from "@/components/product/ProductTabs";
import CharacteristicsTable from "@/components/product/CharacteristicsTable";
type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const slug = (await params).slug;
  const product = await getProductBySlug(slug);

  if (!product?.variations?.length) {
    return notFound();
  }

  const productName = product.name ?? slug;
  const categoryLabel = product.category.name ?? "Міжкімнатні двері / МДФ";
  const characteristics = product.characteristics.map(({ name, value, unit }) => ({
    label: name,
    value: [value, unit].filter(Boolean).join(" "),
  }));
  return (
    <div className="flex flex-col min-h-screen bg-white font-['Outfit',sans-serif]">
      <main className="flex-1">
        <Breadcrumb
          items={[
          {
            label: "Головна",
            href: "/",
          },
          {
            label: categoryLabel,
            href: `/catalog/${product.category.slug}`,
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