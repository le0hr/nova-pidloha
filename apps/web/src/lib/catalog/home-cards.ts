const COLUMNS = 4;
const MIN_SLIDES = 2;

/**
 * Builds the homepage carousel columns (same format as the static design):
 * up to 4 columns, each a vertical carousel with several cards.
 * - Few items: every column shows the whole list, starting from its own offset.
 * - Enough items: categories are interleaved, then dealt so each column scrolls through different cards.
 */
export function homeCardColumns<T>(items: T[], groupKey: (item: T) => string): T[][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = groupKey(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  const ordered: T[] = [];
  const queues = [...groups.values()];
  for (let row = 0; ordered.length < items.length; row += 1) {
    for (const queue of queues) if (row < queue.length) ordered.push(queue[row]);
  }

  const count = Math.min(COLUMNS, ordered.length);
  if (ordered.length < COLUMNS * MIN_SLIDES) {
    return Array.from({ length: count }, (_, column) => ordered.map((_, offset) => ordered[(column + offset) % ordered.length]));
  }
  const columns: T[][] = Array.from({ length: count }, () => []);
  ordered.forEach((item, index) => columns[index % count].push(item));
  return columns;
}

/**
 * One carousel column per group (e.g. door subclass "Каркасно-щитові", or floor category "Ламінат").
 * - More groups than columns: the smallest groups join the shortest columns.
 * - Fewer groups than columns: large groups are split evenly over several columns while each column still scrolls.
 */
export function groupedCardColumns<T>(items: T[], groupKey: (item: T) => string): T[][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = groupKey(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const columns = [...groups.values()].sort((a, b) => b.length - a.length);
  for (const group of columns.splice(COLUMNS)) {
    columns.reduce((shortest, column) => (column.length < shortest.length ? column : shortest)).push(...group);
  }
  // Fewer groups than columns: give spare columns to the groups with the most cards per column,
  // as long as every column keeps at least MIN_SLIDES cards, then deal each group evenly.
  const parts = columns.map(() => 1);
  for (let spare = COLUMNS - columns.length; spare > 0; spare -= 1) {
    let best = -1;
    columns.forEach((group, i) => {
      if (group.length / (parts[i] + 1) >= MIN_SLIDES && (best < 0 || group.length / parts[i] > columns[best].length / parts[best])) best = i;
    });
    if (best < 0) break;
    parts[best] += 1;
  }
  return columns.flatMap((group, i) => Array.from({ length: parts[i] }, (_, part) => group.filter((_, k) => k % parts[i] === part)));
}
