import Header from "@/components/layout/shop/Header";
import Footer from "@/components/layout/shop/Footer";
import CartDrawerWrapper from "@/components/cart/DrawerWrapper";
import { getCategories } from "@/lib/services/category.service";
import { CheckoutAvailabilityProvider } from "@/components/checkout/CheckoutAvailability";
import { checkoutEnabled, getSiteContacts } from "@/lib/site-contacts";

// Catalog data is fetched at runtime; image builds do not need a live CMS.
export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The menu needs no category texts (they are long SEO copy): keep them out of every page's client payload.
  const [all, contacts] = await Promise.all([getCategories(), getSiteContacts()]);
  const categories = all.map(category => ({ ...category, description: undefined }));
  return (
    <CheckoutAvailabilityProvider value={{ enabled: checkoutEnabled(), phone: contacts.phone }}>
      <div className="min-h-screen bg-[#fdfdfd]">
        <Header categories={categories} />
        <main className="min-h-[70vh]">{children}</main>
        <Footer contacts={contacts} />
        <CartDrawerWrapper />
      </div>
    </CheckoutAvailabilityProvider>
  );
}
