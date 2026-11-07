import type { Metadata } from "next";
import HomeMotion from "@/components/home/HomeMotion";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import PopularProducts from "@/components/home/PopularProducts";
import Promotion from "@/components/home/Promotion";
import About from "@/components/home/About";
import Stores from "@/components/home/Stores";
import { getHomeProducts, getHomeHero, getHomeCategories } from "@/lib/services/home.service";

import { getShopLocations } from "@/lib/services/shop.service";

export const metadata: Metadata = {
  title: { absolute: "Нова Підлога та Двері — підлога та двері у Черкасах" },
  description: "Ламінат, SPC, вінілова підлога та міжкімнатні двері у Черкасах. Каталог продукції, конфігуратор дверей та виставкові зали Нова Підлога.",
};

export default async function HomePage() {
  const [products, slides, shops, categories] = await Promise.all([getHomeProducts(), getHomeHero(), getShopLocations(), getHomeCategories()]);

  return (
    <HomeMotion>
      <Hero slides={slides} shops={shops} />
      <Categories categories={categories} />
      <PopularProducts products={products} />
      <Promotion />
      <About />
      <Stores shops={shops} />
    </HomeMotion>
  );
}
