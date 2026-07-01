<!--
  Home-page podcast teaser: a host framing + blurb (`podcast.homeTeaser`)
  that sells the show, then the single most recent "No Man's an Island"
  episode with its cover art and detail (date, duration, excerpt) and a
  play button wired to the sitewide player, plus a "See all episodes" link
  to /podcast. Fetched client-side from the same same-origin Acast proxy the
  podcast page uses; renders nothing until an episode is available (so the
  home page never shows a broken/empty block if the feed is slow or down).
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { podcast } from '$lib/content';
  import { loadEpisodes, type Episode } from '$lib/podcast';
  import { player, playEpisode } from '$lib/player.svelte';
  import PlayPauseIcon from '$lib/components/PlayPauseIcon.svelte';

  let episodes = $state<Episode[]>([]);
  let ready = $state(false);

  const latest = $derived(episodes[0]);

  onMount(async () => {
    try {
      episodes = await loadEpisodes(podcast.feedPath);
      ready = episodes.length > 0;
    } catch (err) {
      console.error('Home podcast teaser failed to load:', err);
    }
  });
</script>

{#if ready && latest}
  <section class="bg-paper-2 section-y">
    <div class="container-page">
      <h2 class="t-h2 text-ink">{podcast.homeTeaser.title}</h2>
      <p class="t-lead mt-4 max-w-2xl text-ink-soft">{podcast.homeTeaser.blurb}</p>

      <p class="t-eyebrow mt-10">Latest episode</p>
      <article class="mt-4 rounded-xl border border-line bg-paper p-5 sm:p-6">
        <div class="flex flex-col gap-5 sm:flex-row">
          <img
            src={latest.image}
            alt=""
            width="128"
            height="128"
            loading="lazy"
            class="h-28 w-28 shrink-0 rounded-lg object-cover shadow-sm sm:h-32 sm:w-32"
          />
          <div class="min-w-0 flex-1">
            <p class="t-eyebrow">
              {#if latest.dateLabel}{latest.dateLabel}{/if}{#if latest.durationLabel}&nbsp;·&nbsp;{latest.durationLabel}{/if}
            </p>
            <h3 class="t-h3 mt-1.5">
              <a
                class="text-navy-900 hover:text-orange-700"
                href={latest.link}
                target="_blank"
                rel="noopener"
              >
                {latest.title}
              </a>
            </h3>
            {#if latest.excerpt}
              <p class="mt-2 line-clamp-3 text-[0.97rem] leading-relaxed text-ink-soft">
                {latest.excerpt}
              </p>
            {/if}
            {#if latest.audioUrl}
              <button
                type="button"
                onclick={() => playEpisode(latest)}
                class="mt-4 inline-flex items-center gap-2 font-semibold text-orange-700 transition-colors hover:text-orange-600"
              >
                <span class="flex shrink-0 items-center justify-center" aria-hidden="true">
                  <PlayPauseIcon playing={player.current?.guid === latest.guid} />
                </span>
                {player.current?.guid === latest.guid ? 'Now playing' : 'Play episode'}
              </button>
            {/if}
          </div>
        </div>
      </article>

      <a
        href="/podcast"
        class="mt-6 inline-flex items-center gap-2 font-semibold text-orange-700 transition-colors hover:text-orange-600"
      >
        See all episodes →
      </a>
    </div>
  </section>
{/if}
