"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Thin red bar at the top from the click on a link until the new page is shown, so a navigation that waits for the
 * server (not prefetched yet, slow network) never looks like nothing happened.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // Marks the moment the page became interactive (client navigation works from here on).
    document.documentElement.dataset.ready = "";
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      clearTimeout(timer.current);
      setState("running");
      // Never keep the bar forever (e.g. a link the router ignores).
      timer.current = setTimeout(() => setState("idle"), 15000);
    };
    // Capture phase: next/link calls preventDefault() on the same click before it would bubble up here.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    setState(current => (current === "running" ? "done" : current));
    timer.current = setTimeout(() => setState("idle"), 400);
  }, [pathname]);

  return <div aria-hidden="true" className="nav-progress" data-state={state} />;
}
