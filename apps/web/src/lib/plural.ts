/** Ukrainian plural: plural(1, "товар", "товари", "товарів") → "товар"; 3 → "товари"; 5, 11–14 → "товарів". */
export function plural(count: number, one: string, few: string, many: string): string {
  const n = Math.abs(count) % 100, last = n % 10;
  if (n >= 11 && n <= 14) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}
