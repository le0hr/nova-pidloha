/**
 * Google tag (GA4 + Google Ads) events. Safe to call anywhere: without a configured tag it does nothing.
 * Key events to mark as conversions in GA4 / import into Google Ads: generate_lead (phone click), add_to_cart.
 */
type Params = Record<string, unknown>;
declare global {
  interface Window { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] }
}

export function trackEvent(name: string, params: Params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export type AnalyticsItem = { item_id: string; item_name: string; item_brand?: string; item_category?: string; item_variant?: string; price?: number; quantity?: number };

export const trackViewItem = (item: AnalyticsItem) =>
  trackEvent("view_item", { currency: "UAH", value: item.price ?? 0, items: [item] });

export const trackAddToCart = (item: AnalyticsItem) =>
  trackEvent("add_to_cart", { currency: "UAH", value: (item.price ?? 0) * (item.quantity ?? 1), items: [item] });
