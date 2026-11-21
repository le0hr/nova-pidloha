import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME, indexable, siteUrl } from "@/lib/seo";
import GoogleTag from "@/components/analytics/GoogleTag";
import NavigationProgress from "@/components/layout/NavigationProgress";

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

const IMAGE_SHELL_SCRIPT = `(function(){function m(e){var t=e.target;if(t&&t.tagName==="IMG"){var s=t.closest(".img-shell");if(s)s.setAttribute("data-loaded","")}}document.addEventListener("load",m,true);document.addEventListener("error",m,true)})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <head>
        {/* Photos: the grey shimmer of an .img-shell box stops once its picture has loaded (or failed). */}
        <script dangerouslySetInnerHTML={{ __html: IMAGE_SHELL_SCRIPT }} />
      </head>
      <body>
        <NavigationProgress />
        {children}
        <GoogleTag enabled={indexable()} />
      </body>
    </html>
  );
}
