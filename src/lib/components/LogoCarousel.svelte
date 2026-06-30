<!--
  Auto-scrolling logo marquee. Logos sit on uniform white cards (equal
  height, object-contain — so Chris's non-proportional strip scaling is
  gone) and render monochrome until hovered. Pauses on hover; falls back
  to a static centred wrap when the user prefers reduced motion.
-->
<script lang="ts">
  import type { OrgLogo } from '$lib/content';

  let { logos, label = 'Organisations' }: { logos: OrgLogo[]; label?: string } = $props();

  // Duplicate the list so the track can loop seamlessly (translateX -50%).
  const loop = $derived([...logos, ...logos]);
</script>

{#if logos.length}
  <div class="marquee" role="group" aria-label={label}>
    <ul class="track">
      {#each loop as org, i (org.name + '-' + i)}
        <li aria-hidden={i >= logos.length ? 'true' : undefined}>
          <span class="card">
            <img src={org.logo} alt={i < logos.length ? org.name : ''} loading="lazy" />
          </span>
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
    animation: marquee 45s linear infinite;
  }
  .marquee:hover .track {
    animation-play-state: paused;
  }
  .card {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 84px;
    /* Auto width + fixed logo HEIGHT → every logo is the same height
       (no tiny wide logos like Barclays); cards just get wider/narrower. */
    width: auto;
    padding: 0 30px;
    background: #fff;
    border: 1px solid var(--color-line);
    border-radius: 10px;
  }
  .card img {
    height: 44px;
    width: auto;
    max-width: 220px;
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
