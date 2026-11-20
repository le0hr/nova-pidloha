import type { Metadata } from "next";
import Header from "@/components/layout/cart/Header";
import { CheckoutAvailabilityProvider } from "@/components/checkout/CheckoutAvailability";
import { checkoutEnabled, getSiteContacts } from "@/lib/site-contacts";
// Cart and checkout are personal pages: never in search results.
export const metadata: Metadata = {
  title: "Кошик",
  robots: { index: false, follow: false },
};

// The checkout switch and contacts are read at run time, not at image build.
export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contacts = await getSiteContacts();
  return (
    <CheckoutAvailabilityProvider value={{ enabled: checkoutEnabled(), phone: contacts.phone }}>
      <div className="min-h-screen bg-[#fdfdfd]">
        <Header contacts={contacts} />
        <main className="min-h-[70vh]">{children}</main>
      </div>
    </CheckoutAvailabilityProvider>
  );
}
