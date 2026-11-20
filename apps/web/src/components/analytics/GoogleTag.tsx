import Script from "next/script";
import PhoneClickTracking from "./PhoneClickTracking";

/** EEA, UK and Switzerland: Google requires consent there, so ads/analytics storage starts denied (cookieless pings). */
const CONSENT_REGIONS = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IS","IE","IT","LV","LI","LT","LU","MT","NL","NO","PL","PT","RO","SK","SI","ES","SE","GB","CH"];

/**
 * Google tag for GA4 and Google Ads. IDs come from the web env GOOGLE_TAG_IDS (comma-separated, e.g. "G-ABC123,AW-123456789"),
 * read at run time — no rebuild needed. Not rendered when empty or when the site may not be indexed (IP / localhost),
 * so tests and the pre-launch server do not pollute the statistics; GOOGLE_TAG_FORCE=true overrides that.
 */
export default function GoogleTag({ enabled }: { enabled: boolean }) {
  const ids = (process.env.GOOGLE_TAG_IDS ?? "").split(",").map(id => id.trim()).filter(id => /^(G|AW|GT|DC)-[A-Z0-9-]+$/i.test(id));
  if (!ids.length || !(enabled || process.env.GOOGLE_TAG_FORCE === "true")) return null;
  const init = [
    "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;",
    `gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:${JSON.stringify(CONSENT_REGIONS)}});`,
    "gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});",
    "gtag('js',new Date());",
    ...ids.map(id => `gtag('config',${JSON.stringify(id)});`),
  ].join("");
  return (
    <>
      <Script id="google-tag-init" strategy="afterInteractive">{init}</Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids[0])}`} strategy="afterInteractive" />
      <PhoneClickTracking />
    </>
  );
}
