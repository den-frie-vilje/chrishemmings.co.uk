<!--
  Home-page podcast teaser: a host framing + blurb (`podcast.homeTeaser`)
  that sells the show, then the five most recent "No Man's an Island"
  episodes in the same click-to-play row layout as the /podcast page (shared
  EpisodeRow), and a "See all episodes" link to /podcast. Fetched client-side
  from the same same-origin Acast proxy; renders nothing until episodes are
  available (so the home page never shows a broken/empty block if the feed is
  slow/down).
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { podcast } from '$lib/content';
  import { loadEpisodes, type Episode } from '$lib/podcast';
  import EpisodeRow from '$lib/components/EpisodeRow.svelte';

  const LIMIT = 5;
  let episodes = $state<Episode[]>([]);
  let ready = $state(false);

  const recent = $derived(episodes.slice(0, LIMIT));
  const moreCount = $derived(Math.max(0, episodes.length - LIMIT));

  onMount(async () => {
    try {
      episodes = await loadEpisodes(podcast.feedPath);
      ready = episodes.length > 0;
    } catch (err) {
      console.error('Home podcast teaser failed to load:', err);
    }
  });
</script>

{#if ready}
  <section class="bg-paper-2 section-y">
    <div class="container-page">
      <h2 class="t-h2 text-ink">{podcast.homeTeaser.title}</h2>
      <p class="t-lead mt-4 max-w-2xl text-ink-soft">{podcast.homeTeaser.blurb}</p>

      <p class="t-eyebrow mt-10">Latest episodes</p>
      <ul class="mt-4">
        {#each recent as ep (ep.guid)}<EpisodeRow {ep} />{/each}
      </ul>

      {#if moreCount > 0}
        <a
          href="/podcast"
          class="flex items-center gap-2 border-t border-line py-4 font-semibold text-orange-700 transition-colors hover:text-orange-600"
        >
          See all episodes →
        </a>
      {/if}
    </div>
  </section>
{/if}
