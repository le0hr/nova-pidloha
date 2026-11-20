import type { Metadata } from "next";
import HomeMotion from "@/components/home/HomeMotion";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import PopularProducts from "@/components/home/PopularProducts";
import Promotion from "@/components/home/Promotion";
import About from "@/components/home/About";
import Stores from "@/components/home/Stores";
import { getHomeProducts, getHomeHero, getHomeCategories, getPromoTicker } from "@/lib/services/home.service";

import { getShopLocations } from "@/lib/services/shop.service";
import JsonLd from "@/components/seo/JsonLd";
import { SEO_FIELDS, SITE_NAME, absoluteUrl, cmsStructuredData, fetchSeo, pageMetadata } from "@/lib/seo";
import { organizationLd } from "@/lib/seo-business";

const homeSeo = () => fetchSeo(`query HomeSeo { global(status: PUBLISHED) { ${SEO_FIELDS} } }`, {}, data => data.global?.seo);

export async function generateMetadata(): Promise<Metadata> {
  const metadata = pageMetadata({
    title: `${SITE_NAME} — підлога та двері у Черкасах`,
    description: "Ламінат, SPC, вінілова підлога та міжкімнатні двері у Черкасах. Каталог продукції, конфігуратор дверей, виставкові зали та доставка по Україні.",
    path: "/",
    image: absoluteUrl("/nova-pidloha.png"),
  }, await homeSeo());
  // The home title already carries the shop name: no " | Нова Підлога та Двері" suffix.
  return { ...metadata, title: { absolute: String(metadata.title) } };
}

export default async function HomePage() {
  const [products, slides, shops, categories, seo, business, promo] = await Promise.all([
    getHomeProducts(), getHomeHero(), getShopLocations(), getHomeCategories(), homeSeo(), organizationLd(), getPromoTicker(),
  ]);

  return (
    <HomeMotion>
      <JsonLd data={[...business, ...cmsStructuredData(seo)]} />
      <Hero slides={slides} shops={shops} />
      <Categories categories={categories} />
      <PopularProducts products={products} />
      <Promotion promo={promo} />
      <About />
      <Stores shops={shops} />
    </HomeMotion>
  );
}
