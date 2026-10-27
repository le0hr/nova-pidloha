const running = new WeakMap<HTMLElement, () => void>();

export function cancelCardScroll(element: HTMLElement) {
  running.get(element)?.();
}

/** A fixed-duration glide; browser smooth scrolling varies with distance. */
export function scrollCard(element: HTMLElement, index: number) {
  cancelCardScroll(element);
  const top = index * element.clientHeight;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    element.scrollTo({ top, behavior: "instant" });
    return;
  }
  const start = element.scrollTop;
  if (start === top) return;
  const previousSnap = element.style.scrollSnapType;
  element.style.scrollSnapType = "none";
  let frame: number;
  const began = performance.now();
  const cancel = () => {
    window.cancelAnimationFrame(frame);
    element.style.scrollSnapType = previousSnap;
    running.delete(element);
  };
  running.set(element, cancel);
  const tick = (now: number) => {
    const progress = Math.min(1, (now - began) / 900);
    const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    element.scrollTo({ top: start + (top - start) * eased, behavior: "instant" });
    if (progress < 1) frame = window.requestAnimationFrame(tick);
    else cancel();
  };
  frame = window.requestAnimationFrame(tick);
}
