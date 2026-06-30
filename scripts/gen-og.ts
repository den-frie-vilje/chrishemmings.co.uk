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
const contact = readJson('src/content/contact.json');

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

const CARDS: Card[] = [
  {
    slug: 'home',
    eyebrow: site.tagline,
    title: site.name,
    subtitle: 'Online therapy for men — UK · Europe · worldwide',
    portrait: home.hero.portrait,
    cta: contact.booking.label
  },
  {
    slug: 'working-together',
    eyebrow: wt.hero.eyebrow,
    title: site.name,
    subtitle: wt.hero.title,
    portrait: wt.hero.portrait,
    cta: contact.booking.label
  },
  {
    slug: 'public-speaking',
    eyebrow: ps.hero.eyebrow,
    title: site.name,
    subtitle: ps.hero.title,
    portrait: ps.hero.portrait,
    cta: ps.hero.cta
  },
  {
    slug: 'podcast',
    eyebrow: podcast.hero.eyebrow,
    title: podcast.hero.title,
    subtitle: podcast.hero.subtitle,
    portrait: podcast.hero.cover,
    cta: contact.booking.label
  },
  {
    slug: 'get-in-touch',
    eyebrow: contact.heading,
    title: site.name,
    subtitle: site.tagline,
    portrait: home.hero.portrait,
    cta: contact.booking.label
  }
];

const NAVY = '#093449';
const ORANGE = '#ff9902';
const ORANGE_LIGHT = '#ffc57e';
const CLOUD = '#e9eff2';

function markup(card: Card): string {
  const portrait = dataUri(card.portrait);
  return `
  <div style="display:flex;width:1200px;height:630px;background:${NAVY};font-family:'Hanken Grotesk';">
    <div style="display:flex;flex-direction:column;justify-content:space-between;width:730px;height:100%;padding:72px 64px;">
      <div style="display:flex;flex-direction:column;">
        <div style="color:${ORANGE_LIGHT};font-size:26px;font-weight:600;letter-spacing:4px;text-transform:uppercase;">${card.eyebrow}</div>
        <div style="color:#ffffff;font-size:76px;font-weight:800;letter-spacing:-2px;line-height:1.02;margin-top:20px;">${card.title}</div>
        <div style="color:${CLOUD};font-size:30px;font-weight:400;line-height:1.3;margin-top:26px;">${card.subtitle}</div>
      </div>
      <div style="display:flex;align-items:center;color:${ORANGE};font-size:25px;font-weight:600;">${card.cta}</div>
    </div>
    <div style="display:flex;width:470px;height:100%;background-image:url(${portrait});background-size:cover;background-position:center;"></div>
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
