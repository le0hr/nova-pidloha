"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/** Any click on a tel: link anywhere on the site is a lead (the main conversion while online checkout is off). */
export default function PhoneClickTracking() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="tel:"]');
      if (link) trackEvent("generate_lead", { method: "phone", page: location.pathname });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
