<!--
  Auto-scrolling logo marquee. Two looks via `variant`:
    'card'  — logos on uniform white cards (equal height, object-contain),
              monochrome until hovered. Good for mixed square-ish brand
              logos on a light section (e.g. commercial clients).
    'strip' — bare wordmarks in a brand-navy DUOTONE (an SVG filter maps
              shadows→navy and highlights→white, so white contents stay white
              and transparency is kept), sized by equal optical area; the real
              brand colours return on hover. The classic "as featured in"
              press wall — even weight across mastheads of very different
              colours and aspects.
  Pauses on hover and via the bindable `paused` prop (the caller renders the
  keyboard-focusable pause/play control — WCAG 2.2.2); falls back to a static
  centred wrap when the user prefers reduced motion.
-->
<script lang="ts">
  import type { OrgLogo } from '$lib/content';

  let {
    logos,
    label = 'Organisations',
    variant = 'card',
    paused = $bindable(false)
  }: {
    logos: OrgLogo[];
    label?: string;
    variant?: 'card' | 'strip';
    paused?: boolean;
  } = $props();

  // Duplicate the list so the track can loop seamlessly (translateX -50%).
  const loop = $derived([...logos, ...logos]);

  // Gate the animation start until the logos have loaded and the duration is
  // sized (set true by `constantSpeed`). Applied via `class:is-ready` — a
  // runtime-added class would be pruned from the scoped CSS.
  let ready = $state(false);

  // Weighted (equal-area) sizing for the bare press strip. Logos vary wildly
  // in aspect — a square network bug vs a very wide masthead — so a uniform
  // height leaves the square one tiny and the wide one enormous. Instead set
  // each logo's height so all occupy roughly the same optical AREA:
  //   height = clamp(MIN, K / sqrt(aspect), MAX)   (equal area ⇒ h ∝ 1/√aspect)
  // Width follows via object-contain, capped in CSS so the widest masthead
  // can't dominate. A generous MAX lets the near-square marks (BBC bugs) run a
  // little taller than pure equal-area, which reads better optically. The
  // track centres every logo vertically.
  function weightedScale(node: HTMLImageElement) {
    const K = 56;
    const MIN = 20;
    const MAX = 50;
    const apply = () => {
      const w = node.naturalWidth;
      const h = node.naturalHeight;
      if (!w || !h) return;
      const height = Math.min(MAX, Math.max(MIN, K / Math.sqrt(w / h)));
      node.style.setProperty('--logo-h', `${height.toFixed(1)}px`);
    };
    if (node.complete) apply();
    node.addEventListener('load', apply);
    return { destroy: () => node.removeEventListener('load', apply) };
  }

  // Constant on-screen speed. The CSS keyframe translates the track by -50%
  // (half its own width) over a fixed duration, so a bare `45s` makes the
  // px/second speed scale with the track width — a narrower track (mobile
  // sizing, or before the weighted sizing has run) visibly crawls. Instead
  // derive the DURATION from the measured travel distance and a target
  // pixels-per-second, and recompute whenever the track resizes (breakpoint
  // change, or logos finishing loading). Speed is then distance ÷ rate — the
  // same on every device — never a fixed value. (Kept as a compositor-driven
  // CSS animation rather than a rAF loop; if this were ever rAF, advance by
  // elapsed time, never a per-frame constant.)
  const PX_PER_SECOND = 42;
  function constantSpeed(node: HTMLElement) {
    const update = () => {
      const travel = node.scrollWidth / 2; // one full set = half the loop
      if (travel > 0) {
        node.style.setProperty('--marquee-duration', `${(travel / PX_PER_SECOND).toFixed(2)}s`);
      }
    };
    // The animation stays paused (static at translateX 0) until the logos have
    // loaded and the width — hence the duration — is final. Starting only then
    // means the duration is never re-timed on a *running* animation, so the
    // load phase can't cause a horizontal jump. Setting a custom prop doesn't
    // change layout, so `update()` on each resize can't feed back into the RO.
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      update();
      ready = true;
    };
    const ro = new ResizeObserver(update);
    ro.observe(node);

    const pending = Array.from(node.querySelectorAll('img')).filter((img) => !img.complete);
    // Belt-and-braces: start even if an image never fires load/error.
    const fallback = setTimeout(start, 2000);
    if (pending.length === 0) {
      start();
    } else {
      let remaining = pending.length;
      const settle = () => {
        if (--remaining === 0) start();
      };
      for (const img of pending) {
        img.addEventListener('load', settle, { once: true });
        img.addEventListener('error', settle, { once: true });
      }
    }
    return {
      destroy: () => {
        ro.disconnect();
        clearTimeout(fallback);
      }
    };
  }
</script>

{#if logos.length}
  {#if variant === 'strip'}
    <!-- Duotone filter: desaturate, then map shadows→brand navy (#093449) and
         highlights→white. Alpha is untouched, so transparent backgrounds stay
         transparent and white logo contents stay white. Applied to each press
         logo at rest; removed on hover to reveal the real brand colours. -->
    <svg class="duotone-def" aria-hidden="true" focusable="false">
      <filter id="press-duotone" color-interpolation-filters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <!-- Darken the shadow/mid tones first (gamma) so colours land deep in
             the navy instead of a washed mid-blue; white highlights (input 1)
             are unaffected, so white contents stay white. -->
        <feComponentTransfer>
          <feFuncR type="gamma" exponent="2.2" />
          <feFuncG type="gamma" exponent="2.2" />
          <feFuncB type="gamma" exponent="2.2" />
        </feComponentTransfer>
        <!-- Duotone map: shadows→navy (#093449), highlights→white. -->
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.035 1" />
          <feFuncG type="table" tableValues="0.204 1" />
          <feFuncB type="table" tableValues="0.286 1" />
        </feComponentTransfer>
      </filter>
    </svg>
  {/if}
  <div class="marquee" role="group" aria-label={label}>
    <ul
      class="track"
      class:paused
      class:strip={variant === 'strip'}
      class:is-ready={ready}
      use:constantSpeed
    >
      {#each loop as org, i (org.name + '-' + i)}
        <li aria-hidden={i >= logos.length ? 'true' : undefined}>
          {#if variant === 'strip'}
            <img
              class="strip-logo"
              src={org.logo}
              alt={i < logos.length ? org.name : ''}
              loading="eager"
              use:weightedScale
            />
          {:else}
            <span class="card">
              <img src={org.logo} alt={i < logos.length ? org.name : ''} loading="eager" />
            </span>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .marquee {
    overflow: hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
  }
  .track {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: max-content;
    /* Duration is derived from the track width by `constantSpeed` so the
       on-screen px/second is constant across devices; 45s is a fallback only. */
    animation: marquee var(--marquee-duration, 45s) linear infinite;
    /* Paused (static at translateX 0) until `constantSpeed` has sized the
       duration and adds .is-ready — so no jump while the logos load. */
    animation-play-state: paused;
  }
  .track.is-ready {
    animation-play-state: running;
  }
  .track.is-ready.paused,
  .marquee:hover .track.is-ready {
    animation-play-state: paused;
  }
  .card {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Equal-sized cards. The logo is contained within a consistent inner
       box so every card matches; per-logo width quirks are normalised by
       trimming the SVGs' own padding (e.g. Barclays). */
    height: 82px;
    width: 176px;
    padding: 16px 24px;
    background: #fff;
    border: 1px solid var(--color-line);
    border-radius: 10px;
  }
  .card img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
    filter: grayscale(1);
    opacity: 0.62;
    transition:
      filter 0.2s ease,
      opacity 0.2s ease;
  }
  .card:hover img {
    filter: grayscale(0);
    opacity: 1;
  }

  /* Hidden SVG filter definition — takes no layout space. */
  .duotone-def {
    position: absolute;
    width: 0;
    height: 0;
  }

  /* Bare press-wall variant: navy DUOTONE (via #press-duotone) so every logo
     reads in one brand tone while white contents stay white; the real colours
     return on hover. Size (equal-area height, capped width) is set per-logo by
     the `weightedScale` action. Vertically centred by the track. */
  .track.strip {
    gap: 2.25rem;
    /* Reserve the tallest logo's height (weightedScale MAX 50px × 0.86 mobile)
       so the strip doesn't grow — and shift the page — as logos load in. */
    min-height: 43px;
  }
  .strip-logo {
    height: calc(var(--logo-h, 30px) * 0.86);
    width: auto;
    max-width: 190px;
    object-fit: contain;
    filter: url(#press-duotone);
    opacity: 0.9;
    transition: opacity 0.2s ease;
  }
  .strip-logo:hover {
    filter: none;
    opacity: 1;
  }
  @media (min-width: 640px) {
    .track.strip {
      gap: 3rem;
      min-height: 50px;
    }
    .strip-logo {
      height: var(--logo-h, 34px);
      max-width: 240px;
    }
  }

  @keyframes marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .track {
      animation: none;
      flex-wrap: wrap;
      width: 100%;
      justify-content: center;
    }
  }
</style>
