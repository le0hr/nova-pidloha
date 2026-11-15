import type { Metadata } from "next";
import Header from "@/components/layout/cart/Header";
// Cart and checkout are personal pages: never in search results.
export const metadata: Metadata = {
  title: "Кошик",
  robots: { index: false, follow: false },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fdfdfd]">
      <Header />
      <main className="min-h-[70vh]">{children}</main>
    </div>
  );
}
