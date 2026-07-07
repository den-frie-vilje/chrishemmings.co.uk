<script lang="ts">
  import { onMount } from 'svelte';
  import { site, podcast } from '$lib/content';
  import { loadEpisodes, type Episode } from '$lib/podcast';
  import { buildPageSeo, absUrl } from '$lib/seo/structured-data';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import ContactSection from '$lib/components/ContactSection.svelte';
  import Prose from '$lib/components/Prose.svelte';
  import EpisodeBrowser from '$lib/components/EpisodeBrowser.svelte';
  import PlatformIcon from '$lib/components/PlatformIcon.svelte';

  const seo = buildPageSeo({
    path: '/podcast',
    title: podcast.seo?.title ?? `${site.name} — ${site.tagline}`,
    description: podcast.seo?.description ?? site.description,
    graph: [
      {
        '@type': 'PodcastSeries',
        name: podcast.hero.title,
        url: absUrl('/podcast'),
        description: podcast.seo?.schemaDescription ?? podcast.seo?.description ?? site.description,
        image: absUrl(podcast.hero.cover),
        webFeed: absUrl(podcast.feedPath),
        sameAs: podcast.platforms.map((p) => p.href)
      }
    ]
  });

  type FeedState = 'loading' | 'ready' | 'error';
  let feedState = $state<FeedState>('loading');
  let episodes = $state<Episode[]>([]);

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
      episodes = await loadEpisodes(podcast.feedPath);
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
  <div class="navy-wash-l pointer-events-none absolute inset-0 z-0" aria-hidden="true"></div>
  <div class="container-page relative z-10 grid items-start gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
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
    <div class="relative -mb-[135px] mt-3 md:order-1 md:mb-0 md:mt-0 md:justify-self-start">
      <img
        src={podcast.hero.cover}
        alt={podcast.hero.coverAlt}
        width="360"
        height="360"
        class="cover-zoom mx-auto w-full max-w-[260px] rounded-xl shadow-lg sm:max-w-[300px] md:mx-0"
      />
    </div>
  </div>
</section>

<!-- About the show — extra top room on mobile so the copy clears the cover
     that overlaps down from the navy hero. -->
<section class="bg-paper section-y">
  <div class="container-page max-w-3xl max-md:mt-[5.5rem]">
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
      <div class="mt-8">
        <EpisodeBrowser {episodes} />
      </div>
    {/if}
  </div>
</section>

<ContactSection details={false} />

<style>
  /* Mobile-only: the cover scales up slightly as the page scrolls
     (scroll-driven). Progressive enhancement — does nothing where
     scroll timelines or motion aren't available. Anchored at the bottom
     so it grows up into the navy, not down over the copy. */
  @keyframes cover-zoom {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.2);
    }
  }
  @media (max-width: 767px) and (prefers-reduced-motion: no-preference) {
    @supports (animation-timeline: view()) {
      .cover-zoom {
        transform-origin: center;
        animation: cover-zoom linear both;
        animation-timeline: view();
        animation-range: contain 0% exit 100%;
      }
    }
  }
</style>
