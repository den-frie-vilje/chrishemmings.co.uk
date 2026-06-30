<!--
  Reusable testimonials block. Used for anonymised therapy-client quotes
  and for commercial / public-speaking client quotes alike.

    variant="featured" — one large centred quote (home hero-adjacent).
    variant="grid"     — a card grid of quotes.

  Renders nothing when `items` is empty, so it's safe to drop on a page
  before any testimonials exist (e.g. commercial quotes Chris adds later).
-->
<script lang="ts">
  import type { Testimonial } from '$lib/content';

  type Surface = 'sand' | 'paper' | 'paper-2';

  interface Props {
    items: Testimonial[];
    eyebrow?: string;
    heading?: string;
    variant?: 'featured' | 'grid';
    surface?: Surface;
  }

  let { items, eyebrow = '', heading = '', variant = 'grid', surface = 'sand' }: Props = $props();

  const SURFACE: Record<Surface, string> = {
    sand: 'bg-sand',
    paper: 'bg-paper',
    'paper-2': 'bg-paper-2'
  };

  /** "Name — Detail, Org" with the optional parts omitted cleanly. */
  function attribution(t: Testimonial): string {
    const tail = [t.detail, t.org].filter(Boolean).join(', ');
    return tail ? `${t.name} — ${tail}` : t.name;
  }
</script>

{#if items.length}
  <section class="{SURFACE[surface]} section-y">
    <div class="container-page">
      {#if variant === 'featured'}
        <figure class="mx-auto max-w-3xl text-center">
          {#if eyebrow}<p class="t-eyebrow">{eyebrow}</p>{/if}
          <blockquote
            class="mt-5 font-serif text-[clamp(22px,3vw,32px)] italic leading-snug text-navy-900"
          >
            “{items[0].quote}”
          </blockquote>
          <figcaption class="mt-5 text-sm font-semibold tracking-wide text-ink-soft">
            — {attribution(items[0])}
          </figcaption>
        </figure>
      {:else}
        {#if heading}<h2 class="t-h2 text-ink">{heading}</h2>{/if}
        {#if eyebrow && !heading}<p class="t-eyebrow">{eyebrow}</p>{/if}
        <div class="mt-8 grid gap-6 md:grid-cols-2">
          {#each items as t (t.quote)}
            <figure class="flex flex-col rounded-xl border border-line bg-paper-2 p-7">
              <blockquote class="font-serif text-[clamp(18px,2vw,22px)] italic leading-snug text-navy-900">
                “{t.quote}”
              </blockquote>
              <figcaption class="mt-5 text-sm font-semibold tracking-wide text-ink-soft">
                — {attribution(t)}
              </figcaption>
            </figure>
          {/each}
        </div>
      {/if}
    </div>
  </section>
{/if}
