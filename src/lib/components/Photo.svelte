<!--
  Responsive photograph. Renders a <picture> with build-generated AVIF/WebP
  srcsets (multi-width, high-DPI-aware) from `photo-manifest.json`, produced
  by `scripts/gen-photos.ts` for everything in `static/img/photos/`. Falls
  back to a plain <img> on the original `src` when the manifest has no entry
  (e.g. a brand-new CMS upload before the next build) — so it never breaks.

  Use ONLY for photographs. Logos, badges and graphics stay as plain <img>.
-->
<script lang="ts">
  import manifestData from '$lib/photo-manifest.json';

  interface PhotoEntry {
    width: number;
    height: number;
    avif: string;
    webp: string;
    fallback: string;
  }
  const manifest = manifestData as Record<string, PhotoEntry>;

  interface Props {
    src: string;
    alt: string;
    /** `sizes` hint so the browser picks the right width. Default: full width. */
    sizes?: string;
    class?: string;
    loading?: 'lazy' | 'eager';
    fetchpriority?: 'high' | 'low' | 'auto';
  }
  let {
    src,
    alt,
    sizes = '100vw',
    class: klass = '',
    loading = 'lazy',
    fetchpriority = 'auto'
  }: Props = $props();

  const entry = $derived(manifest[src]);
</script>

{#if entry}
  <picture class="contents">
    <source type="image/avif" srcset={entry.avif} {sizes} />
    <source type="image/webp" srcset={entry.webp} {sizes} />
    <img
      src={entry.fallback}
      {alt}
      width={entry.width}
      height={entry.height}
      class={klass}
      {loading}
      {fetchpriority}
      decoding="async"
    />
  </picture>
{:else}
  <img {src} {alt} class={klass} {loading} {fetchpriority} decoding="async" />
{/if}
