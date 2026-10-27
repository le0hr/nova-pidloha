import Header from "@/components/layout/cart/Header";
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
