<!--
  Home-page podcast teaser: the five most recent "No Man's an Island"
  episodes in the same click-to-play row layout as the /podcast page (via
  the shared EpisodeRow), capped at five with a "[N] more episodes" link to
  /podcast instead of a load-more. Fetched client-side from the same
  same-origin Acast proxy; renders nothing until episodes are available (so
  the home page never shows a broken/empty block if the feed is slow/down).
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
      <p class="t-eyebrow">Latest Podcast Episodes</p>
      <h2 class="t-h2 mt-2 text-ink">{podcast.hero.title}</h2>

      <ul class="mt-8">
        {#each recent as ep (ep.guid)}<EpisodeRow {ep} />{/each}
      </ul>

      {#if moreCount > 0}
        <a
          href="/podcast"
          class="flex items-center gap-2 border-t border-line py-4 font-semibold text-orange-700 transition-colors hover:text-orange-600"
        >
          {moreCount} more episode{moreCount === 1 ? '' : 's'} →
        </a>
      {/if}
    </div>
  </section>
{/if}
