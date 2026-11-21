// Warms the site after a deploy: opens every page from the sitemap and requests the photo sizes phones and laptops
// use, so the first visitors get ready pages and resized photos.
//   node apps/web/scripts/warm-cache.mjs http://186.240.159.209:432 [concurrency]
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const concurrency = Number(process.argv[3] ?? 4);
const WIDTHS = ["640", "1080"];

const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => base + new URL(m[1]).pathname);
const images = new Set();
let done = 0, failed = 0;

async function pool(items, work) {
  let next = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (next < items.length) await work(items[next++]);
  }));
}

const started = Date.now();
await pool(pages, async (url) => {
  try {
    const html = await (await fetch(url)).text();
    for (const m of html.matchAll(/\/_next\/image\?url=([^&"]+)&(?:amp;)?w=(\d+)/g)) {
      for (const w of WIDTHS) images.add(`${base}/_next/image?url=${m[1]}&w=${w}&q=75`);
    }
  } catch { failed++; }
  if (++done % 50 === 0) console.log(`pages ${done}/${pages.length}`);
});
console.log(`pages: ${pages.length}, photos to warm: ${images.size}`);
done = 0;
await pool([...images], async (url) => {
  try { const r = await fetch(url); await r.arrayBuffer(); if (!r.ok) failed++; } catch { failed++; }
  if (++done % 200 === 0) console.log(`photos ${done}/${images.size}`);
});
console.log(`done in ${Math.round((Date.now() - started) / 1000)} s, failed ${failed}`);
