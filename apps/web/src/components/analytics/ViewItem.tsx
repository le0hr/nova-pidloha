"use client";

import { useEffect } from "react";
import { trackViewItem, type AnalyticsItem } from "@/lib/analytics";

/** Sends GA4 view_item once per product page view (remarketing audiences, Ads optimisation). */
export default function ViewItem({ item }: { item: AnalyticsItem }) {
  const id = item.item_id;
  useEffect(() => { trackViewItem(item); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
