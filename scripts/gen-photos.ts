/**
 * Build-time responsive photo pipeline (photographs only — everything in
 * `static/img/photos/`; logos/badges/graphics live elsewhere and are never
 * touched).
 *
 * For each photo:
 *   1. UPSCALE a too-small source to a high-res master. On CI (linux/amd64)
 *      this is a real ESRGAN AI upscale via UpscalerJS + `@tensorflow/tfjs-node`
 *      (`require('upscaler/node')`); where tfjs-node has no prebuilt (macOS)
 *      it falls back to a sharp Lanczos + unsharp upscale, so local
 *      dev/build never breaks.
 *   2. DOWNSCALE that master with sharp into AVIF + WebP `srcset` widths plus
 *      a broadly-compatible JPEG fallback, and record it in
 *      `src/lib/photo-manifest.json` (consumed by `Photo.svelte`).
 *
 * GATED: each source is content-hashed; a photo whose committed variants
 * already match its hash (and are already AI quality when AI is available)
 * is skipped — so an ordinary deploy does zero image work and only a
 * genuinely changed/added photo is (re)processed.
 *
 * Runs in `prebuild` (the production/staging build a CMS photo change
 * triggers). To refresh committed AI masters from a Mac, run this inside a
 * linux/amd64 container (see `pnpm photos:ci`).
 */
import { readdirSync, mkdirSync, statSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = resolve(root, 'static/img/photos');
const GEN_DIR = resolve(SRC_DIR, '_gen');
const MANIFEST = resolve(root, 'src/lib/photo-manifest.json');

/** Candidate widths (px); only those ≤ the master width are emitted. */
const TARGET_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1600];
/** Sources narrower than this get upscaled to a master first. */
const UPSCALE_BELOW = 900;
const PHOTO_EXT = /\.(jpe?g|png|webp)$/i;

interface PhotoEntry {
  hash: string;
  quality: 'ai' | 'lanczos' | 'source';
  width: number;
  height: number;
  avif: string;
  webp: string;
  fallback: string;
}

// tfjs-node 4.x calls Node's legacy `util.is*` type-checkers, which were
// removed in Node 24+. The repo runs Node ~25, so restore them before loading
// tfjs-node (trivial re-implementations of the deprecated aliases it expects).
{
  const u = require('node:util') as Record<string, unknown>;
  const shim: Record<string, (v: any) => boolean> = {
    isArray: Array.isArray,
    isBoolean: (v) => typeof v === 'boolean',
    isBuffer: Buffer.isBuffer,
    isDate: (v) => v instanceof Date,
    isError: (v) => v instanceof Error,
    isFunction: (v) => typeof v === 'function',
    isNull: (v) => v === null,
    isNullOrUndefined: (v) => v == null,
    isNumber: (v) => typeof v === 'number',
    isObject: (v) => v !== null && typeof v === 'object',
    isPrimitive: (v) => v === null || (typeof v !== 'object' && typeof v !== 'function'),
    isRegExp: (v) => v instanceof RegExp,
    isString: (v) => typeof v === 'string',
    isSymbol: (v) => typeof v === 'symbol',
    isUndefined: (v) => v === undefined
  };
  for (const [k, fn] of Object.entries(shim)) if (typeof u[k] !== 'function') u[k] = fn;
}

// Try to load the AI upscaler. Present on CI (linux/amd64) where tfjs-node has
// a prebuilt binding; absent on macOS — then we Lanczos-upscale instead.
let ai: { tf: any; upscaler: any } | null = null;
try {
  const tf = require('@tensorflow/tfjs-node');
  const Upscaler = require('upscaler/node');
  // esrgan-thick 4× — sharper on retina for our small portraits; falls back
  // to UpscalerJS's bundled 2× default model if the package isn't present.
  let model: unknown;
  try {
    const m = require('@upscalerjs/esrgan-thick/4x');
    model = (m as { default?: unknown }).default ?? m;
  } catch {
    model = undefined;
  }
  ai = { tf, upscaler: model ? new Upscaler({ model }) : new Upscaler() };
  console.log(`photos: AI upscaler ready (${model ? 'esrgan-thick 4×' : 'default 2×'})`);
} catch {
  console.log('photos: tfjs-node unavailable — sharp Lanczos will handle any upscales');
}

async function makeMaster(
  srcPath: string,
  srcW: number,
  srcH: number
): Promise<{ buf: Buffer; w: number; h: number; quality: PhotoEntry['quality'] }> {
  if (srcW >= UPSCALE_BELOW) {
    return { buf: readFileSync(srcPath), w: srcW, h: srcH, quality: 'source' };
  }
  if (ai) {
    try {
      const { tf, upscaler } = ai;
      const image = tf.node.decodeImage(readFileSync(srcPath), 3);
      const out = await upscaler.upscale(image);
      const png = await tf.node.encodePng(out);
      const [h, w] = out.shape as [number, number, number];
      image.dispose();
      out.dispose();
      return { buf: Buffer.from(png), w, h, quality: 'ai' };
    } catch (e) {
      console.warn(`photos: AI upscale failed (${(e as Error).message.split('\n')[0]}); Lanczos fallback`);
    }
  }
  const targetW = Math.min(srcW * 2, 1600);
  const buf = await sharp(srcPath).resize({ width: targetW, kernel: 'lanczos3' }).sharpen({ sigma: 0.6 }).png().toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, w: meta.width ?? targetW, h: meta.height ?? targetW, quality: 'lanczos' };
}

mkdirSync(GEN_DIR, { recursive: true });

const prev: Record<string, PhotoEntry> = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
  : {};
const sources = readdirSync(SRC_DIR).filter((f) => PHOTO_EXT.test(f));
const manifest: Record<string, PhotoEntry> = {};
let built = 0;

for (const file of sources) {
  const srcPath = resolve(SRC_DIR, file);
  const name = basename(file, extname(file));
  const key = `/img/photos/${file}`;
  const hash = createHash('sha256').update(readFileSync(srcPath)).digest('hex').slice(0, 12);
  const entry = prev[key];

  const filesExist = (e?: PhotoEntry) =>
    !!e &&
    [...e.avif.split(', '), ...e.webp.split(', ')]
      .map((s) => resolve(root, 'static' + s.split(' ')[0]))
      .concat(resolve(root, 'static' + e.fallback))
      .every((p) => existsSync(p));
  // Skip when the committed variants already match — unless they're Lanczos
  // and AI is now available to upgrade them.
  const canUpgrade = !!entry && entry.quality === 'lanczos' && !!ai;
  if (entry && entry.hash === hash && filesExist(entry) && !canUpgrade) {
    manifest[key] = entry;
    continue;
  }

  const meta = await sharp(srcPath).metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  if (!srcW || !srcH) {
    console.warn(`photos: skipping ${file} (no dimensions)`);
    continue;
  }

  const master = await makeMaster(srcPath, srcW, srcH);
  const widths = [...new Set([...TARGET_WIDTHS.filter((w) => w <= master.w), master.w])].sort((a, b) => a - b);
  const maxW = Math.max(...widths);
  const maxH = Math.round((maxW * master.h) / master.w);

  for (const w of widths) {
    const pipe = sharp(master.buf).resize({ width: w, kernel: 'lanczos3' });
    await pipe.clone().avif({ quality: 52, effort: 4 }).toFile(resolve(GEN_DIR, `${name}-${w}.avif`));
    await pipe.clone().webp({ quality: 80 }).toFile(resolve(GEN_DIR, `${name}-${w}.webp`));
    if (w === maxW) {
      await pipe.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(GEN_DIR, `${name}-${w}.jpg`));
    }
  }

  manifest[key] = {
    hash,
    quality: master.quality,
    width: maxW,
    height: maxH,
    avif: widths.map((w) => `/img/photos/_gen/${name}-${w}.avif ${w}w`).join(', '),
    webp: widths.map((w) => `/img/photos/_gen/${name}-${w}.webp ${w}w`).join(', '),
    fallback: `/img/photos/_gen/${name}-${maxW}.jpg`
  };
  built++;
  console.log(`photos: ${file} → ${master.quality} master ${master.w}px → ${widths.length} widths (max ${maxW})`);
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`photos: ${sources.length} photo(s), ${built} (re)built.`);
