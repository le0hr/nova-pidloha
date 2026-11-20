/**
 * Swatch photos for decor colours (DecorColor.image): a crop of a product photo that shows only the colour and its
 * texture, as large as possible — no handle, glass, groove, moulding, logo or background.
 *
 *   Doors: the photo background (white / light-grey studio) is removed, the decor colour is taken from the casing and
 *   leaf edge (not from the glass in the middle), and the largest square of smooth pixels of that colour without a
 *   straight line through it is cut out. Solid ("Глухе") variations are tried first.
 *   Floors: only a uniform texture scan is used — a photo where something differs strongly from the floor colour
 *   (furniture, a wall, flowers) is an interior and is skipped; the largest square of the scan is cut out.
 *   Hardware colours are skipped (metal finishes do not crop well from product shots).
 *
 * Colours that already have an image are left as they are (a manager may have uploaded a better one) unless --force.
 *
 * Usage (from apps/cms, CMS stopped when using SQLite; on the server inside the container:
 *   docker compose exec -e STRAPI_SCRIPT=1 cms node scripts/color-swatches.js [--apply]):
 *   STRAPI_SCRIPT=1 node scripts/color-swatches.js --preview=DIR      # plan: crops + contact sheets in DIR
 *   STRAPI_SCRIPT=1 node scripts/color-swatches.js --apply            # upload crops and link them to the colours
 *   --skip=FILE   colours that must get no swatch: external_id or documentId per line, # comments
 *                 (default scripts/color-swatches.skip.txt — crops that showed a logo, joints or the wrong part)
 *   --force       also replace existing swatches
 *   --relaxed     second pass for colours still without a swatch: smaller door crops, the floor part of interior
 *                 photos, and for skip-listed colours another photo than the rejected one. Review the preview!
 *   --import=DIR  upload DIR/<external_id>.webp (reviewed crops, e.g. DIR = <preview>/swatches) and link them
 *   --export=DIR  write every colour's swatch to DIR/<external_id>.webp (to move reviewed swatches to a server)
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const sharp = require('sharp');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const PREVIEW = arg('preview');
const RELAXED = process.argv.includes('--relaxed');
const IMPORT = arg('import');
const EXPORT = arg('export');
const SKIP_FILE = arg('skip') ?? path.join(__dirname, 'color-swatches.skip.txt');
const SKIP = new Set(fs.existsSync(SKIP_FILE) ? fs.readFileSync(SKIP_FILE, 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean) : []);
const SWATCH_SIZE = 480;

// ---------------------------------------------------------------------------------------------------- image analysis

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const labF = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
function lab(r, g, b) {
  const R = lin(r), G = lin(g), B = lin(b);
  const x = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, y = 0.2126 * R + 0.7152 * G + 0.0722 * B, z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  return [116 * labF(y) - 16, 500 * (labF(x) - labF(y)), 200 * (labF(y) - labF(z))];
}
const dE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const median = (values) => { const s = [...values].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };

/** Largest square of `mask` pixels (dynamic programming): { side, x, y } of its top-left corner. */
function largestSquare(mask, w, h) {
  const dp = new Uint16Array(w * h); let best = 0, bx = 0, by = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (!mask[i]) continue;
    dp[i] = x && y ? 1 + Math.min(dp[i - 1], dp[i - w], dp[i - w - 1]) : 1;
    if (dp[i] > best) { best = dp[i]; bx = x; by = y; }
  }
  return { side: best, x: bx - best + 1, y: by - best + 1 };
}

const G = 4; // max local change of lightness/colour inside a swatch (on the slightly blurred photo)
const C = 8; // max colour difference from the decor colour
const FLOOR_C = 26; // floor: farther than this from the floor colour is a foreign object

/**
 * Returns { crop: {left, top, width, height}, rel } in source pixels, rel = swatch side / door width (doors) or
 * / short photo side (floors); or { kind } explaining why the photo gives no swatch.
 */
async function analyse(input, { floor = false, edge = false, relaxed = false } = {}) {
  const meta = await sharp(input).metadata();
  const scale = Math.min(1, 320 / Math.max(meta.width, meta.height));
  const w = Math.max(1, Math.round(meta.width * scale)), h = Math.max(1, Math.round(meta.height * scale));
  const pixels = (blur) => sharp(input).flatten({ background: '#ffffff' }).resize(w, h).removeAlpha().blur(blur).raw().toBuffer();
  const [soft, crisp] = await Promise.all([pixels(1.4), pixels(0.5)]);
  const L = new Array(w * h), Ls = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    L[i] = lab(soft[i * 3], soft[i * 3 + 1], soft[i * 3 + 2]);
    Ls[i] = lab(crisp[i * 3], crisp[i * 3 + 1], crisp[i * 3 + 2])[0];
  }
  const k = 1 / scale;
  const toCrop = ({ side, x, y }, margin = 0) => {
    const m = Math.floor(side * margin);
    const left = Math.max(0, Math.floor((x + m) * k)), top = Math.max(0, Math.floor((y + m) * k));
    // Rounding back to source pixels must not step outside the photo.
    const s = Math.min(Math.floor((side - 2 * m) * k), meta.width - left, meta.height - top);
    return { left, top, width: s, height: s };
  };

  if (floor) {
    const med = [0, 1, 2].map((c) => median(L.map((v) => v[c])));
    const ok = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) ok[i] = dE(L[i], med) < FLOOR_C ? 1 : 0;
    const foreign = 1 - ok.reduce((a, b) => a + b, 0) / (w * h);
    if (foreign > 0.03) return relaxed ? floorOfInterior() : { kind: 'interior' };
    const grown = ok.slice(); // an object's soft edge is not floor either
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!ok[y * w + x])
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const yy = y + dy, xx = x + dx;
        if (yy >= 0 && yy < h && xx >= 0 && xx < w) grown[yy * w + xx] = 0;
      }
    const square = largestSquare(grown, w, h);
    const rel = square.side / Math.min(w, h);
    if (rel >= 0.75) return { kind: 'scan', rel, crop: toCrop(square) };
    return relaxed ? floorOfInterior() : { kind: 'interior' };
  }

  /** Relaxed: the floor of an interior photo — its colour from the lower part, the largest square of it there. */
  function floorOfInterior() {
    const from = Math.floor(h * 0.45), lower = L.slice(from * w);
    const med = [0, 1, 2].map((c) => median(lower.map((v) => v[c])));
    const ok = new Uint8Array(w * h);
    for (let i = from * w; i < w * h; i++) ok[i] = dE(L[i], med) < FLOOR_C * 0.7 ? 1 : 0;
    const grown = ok.slice();
    for (let y = from; y < h; y++) for (let x = 0; x < w; x++) if (!ok[y * w + x])
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const yy = y + dy, xx = x + dx;
        if (yy >= 0 && yy < h && xx >= 0 && xx < w) grown[yy * w + xx] = 0;
      }
    const square = largestSquare(grown, w, h);
    return { kind: 'interior-floor', rel: square.side / Math.min(w, h), crop: toCrop(square, 0.03) };
  }

  // Background: a light flat photo border, flood-filled from the top and the sides (a door photo is often cut at the
  // floor, so the leaf touches the bottom edge). A dark border is the door itself filling the photo.
  const border = [];
  for (let x = 0; x < w; x++) border.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) border.push(y * w, y * w + w - 1);
  const bc = [0, 1, 2].map((c) => median(border.map((i) => L[i][c])));
  const bg = new Uint8Array(w * h);
  if (bc[0] > 75 && border.filter((i) => dE(L[i], bc) < 5).length / border.length > 0.55) {
    const stack = [];
    for (const i of border) if (i < (h - 1) * w && dE(L[i], bc) < 5) stack.push(i, i);
    while (stack.length) {
      const from = stack.pop(), i = stack.pop();
      if (bg[i] || dE(L[i], bc) >= 5 || dE(L[i], L[from]) >= 1.2) continue; // stops at the faint outline of a light door
      bg[i] = 1;
      const x = i % w, y = (i / w) | 0;
      if (x > 0) stack.push(i - 1, i); if (x < w - 1) stack.push(i + 1, i); if (y > 0) stack.push(i - w, i); if (y < h - 1) stack.push(i + w, i);
    }
  }
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let i = 0; i < w * h; i++) {
    if (bg[i]) continue;
    const x = i % w, y = (i / w) | 0;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  if (x1 < 0) return { kind: 'empty' };
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1;

  // Smooth pixels, and the decor colour: the most common smooth colour (of the casing / leaf edge for interior doors).
  const grad = new Float32Array(w * h).fill(99);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    if (!bg[i]) grad[i] = Math.max(Math.abs(L[i + 1][0] - L[i - 1][0]), Math.abs(L[i + w][0] - L[i - w][0]),
      dE(L[i + 1], L[i - 1]) * 0.7, dE(L[i + w], L[i - w]) * 0.7);
  }
  const inBand = (i) => {
    if (!edge) return true;
    const x = i % w, y = (i / w) | 0, dx = Math.min(x - x0, x1 - x) / bw;
    return dx > 0.02 && dx < 0.14 && y > y0 + bh * 0.15 && y < y1 - bh * 0.15;
  };
  const bins = new Map();
  for (let i = 0; i < w * h; i++) if (grad[i] < G && inBand(i)) {
    const key = L[i].map((v) => Math.round(v / 4)).join(',');
    bins.set(key, (bins.get(key) ?? 0) + 1);
  }
  if (!bins.size) return edge ? analyse(input, { floor, edge: false }) : { kind: 'no-smooth-area' };
  const mode = [...bins.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map((v) => Number(v) * 4);
  const near = [];
  for (let i = 0; i < w * h; i++) if (grad[i] < G && inBand(i) && dE(L[i], mode) < C) near.push(L[i]);
  const target = [0, 1, 2].map((c) => median(near.map((v) => v[c])));
  // A flat pure white "decor" is a collage gap or a background patch.
  if (target[0] > 97 && Math.hypot(target[1], target[2]) < 1.5) return { kind: 'blank' };
  const good = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (grad[i] < G && dE(L[i], target) < C) good[i] = 1;

  // Straight grooves, glass strips, moulding edges: a long run of pixels lighter/darker than both neighbours across it.
  const run = Math.max(12, Math.round(bw * 0.12));
  for (const horizontal of [true, false]) {
    const [outer, inner, step] = horizontal ? [h, w, w] : [w, h, 1];
    for (let a = 2; a < outer - 2; a++) {
      let line = [], sign = 0;
      const flush = () => {
        if (line.length >= run) for (const i of line) { good[i] = 0; good[i - step] = 0; good[i + step] = 0; }
        line = [];
      };
      for (let b = 0; b < inner; b++) {
        const i = horizontal ? a * w + b : b * w + a;
        const up = Ls[i] - Math.max(Ls[i - 2 * step], Ls[i + 2 * step]), down = Math.min(Ls[i - 2 * step], Ls[i + 2 * step]) - Ls[i];
        const s = up > 1.6 ? 1 : down > 1.6 ? -1 : 0;
        if (s && (s === sign || !line.length)) { line.push(i); sign = s; } else { flush(); if (s) { line.push(i); sign = s; } }
      }
      flush();
    }
  }
  const square = largestSquare(good, w, h);
  const crop = toCrop(square, 0.05); // keep clear of the edge that stopped the square
  return { kind: 'door', rel: (square.side * 0.9) / bw, crop };
}

/** Best swatch of a colour from its variation photos, or null. */
async function swatchFor(color, readFile, relaxed = false) {
  const floor = color.category.startsWith('pidloha');
  const edge = !floor && !/vhidni/.test(color.category);
  const solid = (im) => !im.glass || (/^глухе/i.test(im.glass) && !/\+|сатин|скло|дзеркал/i.test(im.glass));
  const strictOk = (r) => r.crop.width >= 60 && r.rel >= (floor ? 0.75 : 0.15) && r.kind !== 'interior-floor';
  const relaxedOk = (r) => r.crop.width >= 40 && r.rel >= (floor ? 0.3 : 0.07);
  const candidates = [];
  for (const im of color.images) {
    const input = await readFile(im.url).catch(() => null);
    if (!input) continue;
    const result = await analyse(input, { floor, edge, relaxed }).catch(() => null);
    if (!result?.crop || !(strictOk(result) || (relaxed && relaxedOk(result)))) continue;
    // A solid door beats any glazed one; a strict crop beats a relaxed one.
    candidates.push({ ...result, input, url: im.url, strict: strictOk(result), score: result.rel + (solid(im) ? 10 : 0) + (strictOk(result) ? 100 : 0) });
  }
  candidates.sort((a, b) => b.score - a.score);
  // A skip-listed colour: its best strict crop was rejected on review, so never that photo again.
  const rejected = color.skipped ? candidates.find((c) => c.strict)?.url : null;
  const best = candidates.find((c) => c.url !== rejected);
  if (!best) return null;
  const buffer = await sharp(best.input).extract(best.crop)
    .resize(SWATCH_SIZE, SWATCH_SIZE, { fit: 'cover', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  return { buffer, source: best.url, crop: best.crop, kind: best.kind };
}

// ----------------------------------------------------------------------------------------------------------- strapi

async function main(strapi) {
  const COLOR = 'api::decor-color.decor-color';
  const colors = [];
  for (let start = 0; ; start += 100) {
    const page = await strapi.documents(COLOR).findMany({
      status: 'published', start, limit: 100, fields: ['name', 'external_id'],
      populate: {
        image: { fields: ['url'] },
        product_variations: {
          fields: ['active'],
          populate: {
            image: { fields: ['url'] },
            decor_glass: { fields: ['name'] },
            products: { fields: ['name'], populate: { category: { fields: ['slug'] } } },
          },
        },
      },
    });
    colors.push(...page);
    if (page.length < 100) break;
  }

  const todo = [];
  for (const color of colors) {
    const skipped = SKIP.has(color.documentId) || SKIP.has(color.external_id);
    if ((skipped && !RELAXED) || (color.image && !FORCE)) continue;
    const variations = (color.product_variations ?? []).filter((v) => v.active !== false && v.image?.url);
    const category = variations.flatMap((v) => v.products ?? []).map((p) => p.category?.slug).find(Boolean) ?? '';
    if (!variations.length || category.startsWith('furnitura')) continue;
    const images = [];
    for (const v of variations) if (!images.some((im) => im.url === v.image.url)) images.push({ url: v.image.url, glass: v.decor_glass?.name ?? null });
    todo.push({ documentId: color.documentId, externalId: color.external_id, name: color.name, category, images, skipped });
  }
  if (EXPORT) return exportSwatches(strapi, colors);
  if (IMPORT) return importSwatches(strapi, colors);
  console.log(`${colors.length} colours, ${colors.filter((c) => c.image).length} with a swatch, ${todo.length} to try.`);

  const publicDir = strapi.dirs.static.public;
  const readFile = async (url) => (/^https?:/.test(url)
    ? Buffer.from(await (await fetch(url)).arrayBuffer())
    : fs.promises.readFile(path.join(publicDir, url)));

  const results = [];
  for (const [n, color] of todo.entries()) {
    const swatch = await swatchFor(color, readFile, RELAXED);
    results.push({ color, swatch });
    if ((n + 1) % 50 === 0) console.log(`  ${n + 1}/${todo.length}`);
  }
  const found = results.filter((r) => r.swatch);
  console.log(`Swatches found: ${found.length} of ${todo.length} (doors ${found.filter((r) => !r.color.category.startsWith('pidloha')).length}, floors ${found.filter((r) => r.color.category.startsWith('pidloha')).length}).`);

  if (PREVIEW) await preview(PREVIEW, results);
  if (!APPLY) { console.log('Plan only. Add --apply to upload and link.'); return; }

  for (const { color, swatch } of found) await link(strapi, color, swatch.buffer);
  console.log(`Linked ${found.length} swatches.`);
}

/** Upload one swatch and make it the colour's image (draft and published). */
async function link(strapi, color, buffer) {
  const COLOR = 'api::decor-color.decor-color';
  const name = `swatch-${color.externalId ?? color.documentId}.webp`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'swatch-'));
  const filepath = path.join(tmp, name);
  fs.writeFileSync(filepath, buffer);
  try {
    const [file] = await strapi.plugin('upload').service('upload').upload({
      data: { fileInfo: { name, alternativeText: color.name, caption: `Swatch: ${color.name}` } },
      files: { filepath, originalFilename: name, mimetype: 'image/webp', size: buffer.length },
    });
    await strapi.documents(COLOR).update({ documentId: color.documentId, data: { image: file.id } });
    await strapi.documents(COLOR).publish({ documentId: color.documentId });
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

/** DIR/<external_id>.webp → the colour with that external_id (or documentId); colours with a swatch only with --force. */
async function importSwatches(strapi, colors) {
  const byKey = new Map(colors.flatMap((c) => [[c.external_id, c], [c.documentId, c]]).filter(([k]) => k));
  let done = 0, missing = 0, kept = 0;
  for (const file of fs.readdirSync(IMPORT).filter((f) => f.endsWith('.webp'))) {
    const color = byKey.get(file.replace(/\.webp$/, ''));
    if (!color) { missing += 1; continue; }
    if (color.image && !FORCE) { kept += 1; continue; }
    await link(strapi, { documentId: color.documentId, externalId: color.external_id, name: color.name }, fs.readFileSync(path.join(IMPORT, file)));
    done += 1;
  }
  console.log(`Imported ${done}; already had a swatch ${kept}; no such colour ${missing}.`);
}

/** Every colour's current swatch → DIR/<external_id>.webp. */
async function exportSwatches(strapi, colors) {
  fs.mkdirSync(EXPORT, { recursive: true });
  const publicDir = strapi.dirs.static.public;
  let done = 0;
  for (const color of colors) {
    if (!color.image?.url || !color.external_id) continue;
    const url = color.image.url;
    const buffer = /^https?:/.test(url) ? Buffer.from(await (await fetch(url)).arrayBuffer()) : fs.readFileSync(path.join(publicDir, url));
    fs.writeFileSync(path.join(EXPORT, `${color.external_id}.webp`), buffer);
    done += 1;
  }
  console.log(`Exported ${done} swatches to ${EXPORT}.`);
}

/** DIR/swatches/<documentId>.webp, DIR/sheet-N.jpg (crop + name, red = no swatch), DIR/plan.json. */
async function preview(dir, results) {
  fs.mkdirSync(path.join(dir, 'swatches'), { recursive: true });
  const T = 150, cols = 8, rows = 6, label = 30;
  const esc = (s) => s.replace(/[<&>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const ordered = [...results].sort((a, b) => a.color.category.localeCompare(b.color.category) || a.color.name.localeCompare(b.color.name, 'uk'));
  for (let sheet = 0; sheet * cols * rows < ordered.length; sheet++) {
    const tiles = [];
    for (const [i, { color, swatch }] of ordered.slice(sheet * cols * rows, (sheet + 1) * cols * rows).entries()) {
      const image = swatch ? await sharp(swatch.buffer).resize(T, T).toBuffer()
        : await sharp({ create: { width: T, height: T, channels: 3, background: '#e53935' } }).png().toBuffer();
      const text = Buffer.from(`<svg width="${T}" height="${label}"><rect width="100%" height="100%" fill="#fff"/>
        <text x="3" y="12" font-size="10" font-family="sans-serif">${esc(color.name.slice(0, 28))}</text>
        <text x="3" y="25" font-size="9" fill="#888" font-family="sans-serif">${sheet * cols * rows + i} ${esc(color.category.slice(0, 24))}</text></svg>`);
      tiles.push({ input: text, left: (i % cols) * (T + 4), top: Math.floor(i / cols) * (T + label + 4) });
      tiles.push({ input: image, left: (i % cols) * (T + 4), top: Math.floor(i / cols) * (T + label + 4) + label });
    }
    await sharp({ create: { width: cols * (T + 4), height: rows * (T + label + 4), channels: 3, background: '#666' } })
      .composite(tiles).jpeg({ quality: 80 }).toFile(path.join(dir, `sheet-${sheet + 1}.jpg`));
  }
  for (const { color, swatch } of results) if (swatch) fs.writeFileSync(path.join(dir, 'swatches', `${color.externalId ?? color.documentId}.webp`), swatch.buffer);
  fs.writeFileSync(path.join(dir, 'plan.json'), JSON.stringify(ordered.map(({ color, swatch }, index) => ({
    index, documentId: color.documentId, externalId: color.externalId, kind: swatch?.kind ?? null, name: color.name, category: color.category, source: swatch?.source ?? null, crop: swatch?.crop ?? null,
  })), null, 1));
  console.log(`Preview: ${dir}`);
}

(async () => {
  // In the Docker image there is no src/, only the built dist/.
  const options = fs.existsSync('src') ? await compileStrapi() : { appDir: process.cwd(), distDir: path.join(process.cwd(), 'dist') };
  const strapi = await createStrapi(options).load();
  try { await main(strapi); }
  catch (error) { console.error('ERROR:', error.message); process.exitCode = 1; }
  finally { await strapi.destroy(); }
})();
