import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME, indexable, siteUrl } from "@/lib/seo";
import GoogleTag from "@/components/analytics/GoogleTag";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteUrl()),
    applicationName: SITE_NAME,
    title: {
      default: `${SITE_NAME} — підлога та двері у Черкасах`,
      template: `%s | ${SITE_NAME}`,
    },
    description: "Ламінат, SPC, вінілова підлога та міжкімнатні двері у Черкасах. Каталог, конфігуратор дверей, доставка по Україні.",
    openGraph: { siteName: SITE_NAME, locale: "uk_UA", type: "website" },
    robots: indexable() ? { index: true, follow: true } : { index: false, follow: false },
    formatDetection: { telephone: false },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>
        {children}
        <GoogleTag enabled={indexable()} />
      </body>
    </html>
  );
}
