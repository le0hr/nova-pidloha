import Header from "@/components/layout/shop/Header";
import Footer from "@/components/layout/shop/Footer";
import CartDrawerWrapper from "@/components/cart/DrawerWrapper";
import { getCategories } from "@/lib/services/category.service";

// Catalog data is fetched at runtime; image builds do not need a live CMS.
export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();
  return (
    <div className="min-h-screen bg-[#fdfdfd]">
      <Header categories={categories} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
      <CartDrawerWrapper />
    </div>
  );
}
