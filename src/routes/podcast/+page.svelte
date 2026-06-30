<script lang="ts">
  import { onMount } from 'svelte';
  import { site, podcast } from '$lib/content';
  import { parseFeed, type Episode } from '$lib/podcast';
  import { buildPageSeo } from '$lib/seo/structured-data';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import ContactSection from '$lib/components/ContactSection.svelte';
  import Prose from '$lib/components/Prose.svelte';
  import EpisodesEditorial from '$lib/components/EpisodesEditorial.svelte';
  import EpisodesCovers from '$lib/components/EpisodesCovers.svelte';

  // Episode card direction — 'editorial' (text-forward list) or
  // 'covers' (visual artwork grid). Flip to compare / once chosen.
  type Variant = 'editorial' | 'covers';
  const VARIANT = 'editorial' as Variant;

  const seo = buildPageSeo({
    path: '/podcast',
    title: `No Man's an Island — Podcast · ${site.name}`,
    description: podcast.hero.intro
  });

  type FeedState = 'loading' | 'ready' | 'error';
  let feedState = $state<FeedState>('loading');
  let episodes = $state<Episode[]>([]);

  onMount(async () => {
    try {
      const res = await fetch(podcast.feedPath, { headers: { accept: 'application/rss+xml' } });
      if (!res.ok) throw new Error(`Feed responded ${res.status}`);
      episodes = parseFeed(await res.text());
      feedState = 'ready';
    } catch (err) {
      console.error('Podcast feed load failed:', err);
      feedState = 'error';
    }
  });
</script>

<SeoHead {seo} />

<!-- Hero -->
<section class="bg-navy-900 text-paper section-y">
  <div class="container-page grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
    <div class="md:order-2">
      <p class="t-eyebrow !text-orange-300">{podcast.hero.eyebrow}</p>
      <h1 class="t-display mt-4 text-paper">{podcast.hero.title}</h1>
      <p class="mt-3 text-[1.05rem] font-semibold text-orange-300">{podcast.hero.subtitle}</p>
      <p class="t-lead mt-5 max-w-xl text-cloud">{podcast.hero.intro}</p>
      <div class="mt-7 flex flex-wrap gap-3">
        {#each podcast.platforms as p (p.name)}
          <a class="btn btn-on-navy" href={p.href} target="_blank" rel="noopener">{p.name}</a>
        {/each}
      </div>
    </div>
    <div class="md:order-1 md:justify-self-start">
      <img
        src={podcast.hero.cover}
        alt={podcast.hero.coverAlt}
        width="360"
        height="360"
        class="w-full max-w-[300px] rounded-xl shadow-lg"
      />
    </div>
  </div>
</section>

<!-- About the show -->
<section class="bg-paper section-y">
  <div class="container-page max-w-3xl">
    <Prose md={podcast.about} />
  </div>
</section>

<!-- Episodes (client-side from the Acast feed) -->
<section class="bg-paper-2 section-y">
  <div class="container-page">
    <h2 class="t-h2 text-ink">Latest episodes</h2>

    {#if feedState === 'loading'}
      <p class="mt-8 text-ink-soft" aria-live="polite">Loading episodes…</p>
    {:else if feedState === 'error'}
      <div class="mt-8 rounded-lg border border-line bg-paper p-6" aria-live="polite">
        <p class="text-ink">Episodes couldn't be loaded right now.</p>
        <p class="mt-2 text-ink-soft">
          You can listen on
          {#each podcast.platforms as p, i (p.name)}<a class="text-blue-600 underline" href={p.href} target="_blank" rel="noopener">{p.name}</a>{#if i < podcast.platforms.length - 1}{', '}{/if}{/each}.
        </p>
      </div>
    {:else}
      <div class="mt-8">
        {#if VARIANT === 'covers'}
          <EpisodesCovers {episodes} />
        {:else}
          <EpisodesEditorial {episodes} />
        {/if}
      </div>
    {/if}
  </div>
</section>

<ContactSection details={false} />
