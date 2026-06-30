<script lang="ts">
  import { onMount } from 'svelte';
  import { site, podcast } from '$lib/content';
  import { parseFeed, groupBySeason, type Episode } from '$lib/podcast';
  import { buildPageSeo, absUrl } from '$lib/seo/structured-data';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import ContactSection from '$lib/components/ContactSection.svelte';
  import Prose from '$lib/components/Prose.svelte';
  import EpisodesEditorial from '$lib/components/EpisodesEditorial.svelte';
  import EpisodesCovers from '$lib/components/EpisodesCovers.svelte';
  import PlatformIcon from '$lib/components/PlatformIcon.svelte';

  // Episode card direction — 'editorial' (text-forward list) or
  // 'covers' (visual artwork grid). Flip to compare / once chosen.
  type Variant = 'editorial' | 'covers';
  const VARIANT = 'editorial' as Variant;

  const seo = buildPageSeo({
    path: '/podcast',
    title: `No Man's an Island — Podcast · ${site.name}`,
    description:
      "No Man's an Island — honest conversations about men's mental health, co-hosted by Chris Hemmings. New episode every Tuesday.",
    graph: [
      {
        '@type': 'PodcastSeries',
        name: podcast.hero.title,
        url: absUrl('/podcast'),
        description:
          "Honest, grounded conversations about men's mental health and masculinity, powered by Men's Therapy Hub.",
        image: absUrl(podcast.hero.cover),
        webFeed: absUrl(podcast.feedPath),
        sameAs: podcast.platforms.map((p) => p.href)
      }
    ]
  });

  type FeedState = 'loading' | 'ready' | 'error';
  let feedState = $state<FeedState>('loading');
  let episodes = $state<Episode[]>([]);

  // Group into seasons only when the feed actually spans more than one;
  // a single season stays a flat list.
  const seasons = $derived(groupBySeason(episodes));
  const useSeasons = $derived(seasons.length > 1);

  // Stable status string for a single persistent live region, so the
  // resolved/failed state is announced reliably (rather than mounting and
  // unmounting separate aria-live nodes).
  const status = $derived(
    feedState === 'loading'
      ? 'Loading episodes…'
      : feedState === 'error'
        ? "Episodes couldn't be loaded."
        : `${episodes.length} episode${episodes.length === 1 ? '' : 's'} loaded.`
  );

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
<section class="relative isolate z-10 bg-navy-900 text-paper section-y">
  <!-- Large radial pooling a slightly darker navy behind the cover so the
       (navy-toned) artwork doesn't blend into the flat hero. Follows the
       cover: bottom on small screens, left column on md+. -->
  <div class="podcast-wash pointer-events-none absolute inset-0 z-0" aria-hidden="true"></div>
  <div class="container-page relative z-10 grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
    <div class="md:order-2">
      <p class="t-eyebrow !text-orange-300">{podcast.hero.eyebrow}</p>
      <h1 class="t-display mt-4 text-paper">{podcast.hero.title}</h1>
      <p class="mt-3 text-[1.05rem] font-semibold text-orange-300">{podcast.hero.subtitle}</p>
      <p class="t-lead mt-5 max-w-xl text-cloud">{podcast.hero.intro}</p>
      <div class="mt-7 flex flex-wrap gap-3">
        {#each podcast.platforms as p (p.name)}
          <a class="btn btn-on-navy" href={p.href} target="_blank" rel="noopener">
            <PlatformIcon name={p.name} class="h-5 w-5" />
            {p.name}
          </a>
        {/each}
      </div>
    </div>
    <div class="relative -mb-[135px] md:order-1 md:mb-0 md:justify-self-start">
      <img
        src={podcast.hero.cover}
        alt={podcast.hero.coverAlt}
        width="360"
        height="360"
        class="mx-auto w-full max-w-[260px] rounded-xl shadow-lg sm:max-w-[300px] md:mx-0"
      />
    </div>
  </div>
</section>

<!-- About the show — extra top room on mobile so the copy clears the cover
     that overlaps down from the navy hero. -->
<section class="bg-paper section-y">
  <div class="container-page max-w-3xl max-md:mt-24">
    <Prose md={podcast.about} />
  </div>
</section>

<!-- Episodes (client-side from the Acast feed) -->
<section class="bg-paper-2 section-y">
  <div class="container-page">
    <h2 class="t-h2 text-ink">Latest episodes</h2>

    <!-- Single persistent live region — reliably announces each state change. -->
    <p class="sr-only" role="status" aria-live="polite">{status}</p>

    {#if feedState === 'loading'}
      <p class="mt-8 text-ink-soft">Loading episodes…</p>
    {:else if feedState === 'error'}
      <div class="mt-8 rounded-lg border border-line bg-paper p-6">
        <p class="text-ink">Episodes couldn't be loaded right now.</p>
        <p class="mt-2 text-ink-soft">
          You can listen on
          {#each podcast.platforms as p, i (p.name)}<a class="text-blue-600 underline" href={p.href} target="_blank" rel="noopener">{p.name}</a>{#if i < podcast.platforms.length - 1}{', '}{/if}{/each}.
        </p>
      </div>
    {:else}
      {#snippet episodeList(eps: Episode[])}
        {#if VARIANT === 'covers'}
          <EpisodesCovers episodes={eps} />
        {:else}
          <EpisodesEditorial episodes={eps} />
        {/if}
      {/snippet}

      <div class="mt-8">
        {#if useSeasons}
          <div class="space-y-4">
            {#each seasons as s, i (s.number)}
              <details
                class="group rounded-xl border border-line bg-paper px-5 py-1 sm:px-6"
                open={i === 0}
              >
                <summary
                  class="flex cursor-pointer list-none items-center justify-between gap-4 py-4 marker:hidden"
                >
                  <span class="t-h3 text-navy-900">Season {s.number}</span>
                  <span class="t-eyebrow flex items-center gap-2">
                    {s.episodes.length} episode{s.episodes.length === 1 ? '' : 's'}
                    <svg
                      class="h-4 w-4 transition-transform group-open:rotate-180"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </summary>
                <div class="pb-3">
                  {@render episodeList(s.episodes)}
                </div>
              </details>
            {/each}
          </div>
        {:else}
          {@render episodeList(episodes)}
        {/if}
      </div>
    {/if}
  </div>
</section>

<ContactSection details={false} />

<style>
  /* Darker-navy radial behind the podcast cover. Bottom-centred on small
     screens (cover sits below the copy), left column on md+. */
  .podcast-wash {
    background: radial-gradient(
      90% 55% at 50% 86%,
      rgba(3, 19, 28, 0.85) 0%,
      rgba(3, 19, 28, 0.4) 42%,
      transparent 74%
    );
  }
  @media (min-width: 768px) {
    .podcast-wash {
      background: radial-gradient(
        62% 95% at 26% 52%,
        rgba(3, 19, 28, 0.85) 0%,
        rgba(3, 19, 28, 0.4) 42%,
        transparent 74%
      );
    }
  }
</style>
