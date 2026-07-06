/**
 * Open Graph image generator — pure TypeScript, no native image tooling.
 *
 * Renders one 1200×630 PNG per page into `static/img/og/<slug>.png` using
 * satori (HTML/CSS → SVG) + @resvg/resvg-js (SVG → PNG). Runs in the
 * `prebuild` hook, so it works the same locally and in the GitHub/Docker
 * CI build (pure JS + wasm/native resvg — no ImageMagick).
 *
 * Text + the portrait are pulled from the content JSON, so the cards
 * update whenever Chris edits copy or swaps his photo in the CMS and the
 * site is rebuilt. Keep the page list below in sync with the routes.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p: string) => readFileSync(resolve(root, p));
const readJson = (p: string) => JSON.parse(read(p).toString('utf8'));

const site = readJson('src/content/site.json');
const home = readJson('src/content/home.json');
const wt = readJson('src/content/working-together.json');
const ps = readJson('src/content/public-speaking.json');
const podcast = readJson('src/content/podcast.json');
const getInTouch = readJson('src/content/get-in-touch.json');

const FONTS = [
  { name: 'Hanken Grotesk', weight: 400 as const, file: 'hanken-grotesk-latin-400-normal.woff' },
  { name: 'Hanken Grotesk', weight: 600 as const, file: 'hanken-grotesk-latin-600-normal.woff' },
  { name: 'Hanken Grotesk', weight: 800 as const, file: 'hanken-grotesk-latin-800-normal.woff' }
].map((f) => ({
  name: f.name,
  weight: f.weight,
  style: 'normal' as const,
  data: read(`node_modules/@fontsource/hanken-grotesk/files/${f.file}`)
}));

/** Embed a static image as a data URI so satori needs no network/file fetch. */
function dataUri(publicPath: string): string {
  const rel = publicPath.replace(/^\//, 'static/');
  const ext = rel.split('.').pop()!.toLowerCase();
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${read(rel).toString('base64')}`;
}

interface Card {
  slug: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  portrait: string;
  cta: string;
}

// Share-card copy AND photo come from each page's `og` block in the content
// JSON (CMS-editable). The name + tagline lockup is added by the layout below
// (from site.json); the photo is `og.image` — individually selectable per page
// and NOT tied to the page hero (defaults to the page's portrait as a
// placeholder).
const CARDS: Card[] = [
  { slug: 'home', ...home.og, portrait: home.og.image },
  { slug: 'working-together', ...wt.og, portrait: wt.og.image },
  { slug: 'public-speaking', ...ps.og, portrait: ps.og.image },
  { slug: 'podcast', ...podcast.og, portrait: podcast.og.image },
  { slug: 'get-in-touch', ...getInTouch.og, portrait: getInTouch.og.image }
];

const NAVY = '#093449';
const NAVY_950 = '#06283a';
const ORANGE = '#ff9902';
const ORANGE_LIGHT = '#ffc57e';
const CLOUD = '#e9eff2';
const NBSP = String.fromCharCode(160);
const NAME: string = site.name;
const TAGLINE: string = site.tagline;

/** Bind the last two words with a non-breaking space so a wrapped line
 *  never leaves a single-word orphan. */
function noOrphans(text: string): string {
  const words = text.trim().split(' ');
  if (words.length < 2) return text;
  const last = words.pop();
  return `${words.join(' ')}${NBSP}${last}`;
}

function markup(card: Card): string {
  const portrait = dataUri(card.portrait);
  return `
  <div style="display:flex;width:1200px;height:630px;background:${NAVY};font-family:'Hanken Grotesk';">
    <div style="display:flex;flex-direction:column;justify-content:space-between;width:742px;height:100%;padding:62px;">
      <div style="display:flex;align-items:baseline;">
        <span style="color:#ffffff;font-size:25px;font-weight:700;letter-spacing:-0.3px;">${NAME}</span>
        <span style="color:${ORANGE_LIGHT};font-size:25px;font-weight:500;margin-left:14px;">${TAGLINE}</span>
      </div>
      <div style="display:flex;flex-direction:column;">
        <div style="color:${ORANGE_LIGHT};font-size:26px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">${card.eyebrow}</div>
        <div style="color:#ffffff;font-size:78px;font-weight:800;letter-spacing:-2.5px;line-height:1.0;margin-top:18px;">${noOrphans(card.title)}</div>
        <div style="color:${CLOUD};font-size:32px;font-weight:400;line-height:1.28;margin-top:24px;">${noOrphans(card.subtitle)}</div>
      </div>
      <div style="display:flex;">
        <div style="display:flex;align-items:center;background:${ORANGE};color:${NAVY_950};font-size:24px;font-weight:700;padding:15px 30px;border-radius:9999px;">${noOrphans(card.cta)}</div>
      </div>
    </div>
    <img src="${portrait}" width="458" height="630" style="width:458px;height:630px;object-fit:cover;object-position:50% 30%;" />
  </div>`;
}

async function renderCard(card: Card): Promise<void> {
  const svg = await satori(html(markup(card)) as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: FONTS
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  const out = resolve(root, `static/img/og/${card.slug}.png`);
  writeFileSync(out, png);
  console.log(`og: wrote static/img/og/${card.slug}.png (${(png.length / 1024).toFixed(1)} KB)`);
}

mkdirSync(resolve(root, 'static/img/og'), { recursive: true });
for (const card of CARDS) {
  await renderCard(card);
}
