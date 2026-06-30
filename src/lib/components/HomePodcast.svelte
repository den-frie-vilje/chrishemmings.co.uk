<!--
  Home-page podcast teaser: the latest "No Man's an Island" episode with
  the player, plus a "[N] more episodes" link to /podcast. Fetched
  client-side from the same same-origin Acast proxy the podcast page uses;
  renders nothing until an episode is available (so the home page never
  shows a broken/empty block if the feed is slow or down).
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { podcast } from '$lib/content';
  import { parseFeed, type Episode } from '$lib/podcast';
  import AudioPlayer from './AudioPlayer.svelte';

  let episodes = $state<Episode[]>([]);
  let ready = $state(false);

  const latest = $derived(episodes[0]);
  const moreCount = $derived(Math.max(0, episodes.length - 1));

  onMount(async () => {
    try {
      const res = await fetch(podcast.feedPath, { headers: { accept: 'application/rss+xml' } });
      if (!res.ok) return;
      episodes = parseFeed(await res.text());
      ready = episodes.length > 0;
    } catch (err) {
      console.error('Home podcast teaser failed to load:', err);
    }
  });
</script>

{#if ready && latest}
  <section class="bg-paper-2 section-y">
    <div class="container-page">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="t-eyebrow">{podcast.hero.eyebrow} · {podcast.hero.title}</p>
          <h2 class="t-h2 mt-2 text-ink">Latest podcast episode</h2>
        </div>
        {#if moreCount > 0}
          <a
            class="font-semibold text-orange-700 hover:text-orange-600"
            href="/podcast"
          >
            {moreCount} more episode{moreCount === 1 ? '' : 's'} →
          </a>
        {/if}
      </div>

      <article class="mt-6 rounded-xl border border-line bg-paper p-5 sm:p-6">
        <div class="flex gap-5">
          <img
            src={latest.image}
            alt=""
            width="96"
            height="96"
            loading="lazy"
            class="hidden h-24 w-24 shrink-0 rounded-lg object-cover sm:block"
          />
          <div class="min-w-0 flex-1">
            <p class="t-eyebrow">
              {#if latest.dateLabel}{latest.dateLabel}{/if}{#if latest.durationLabel}&nbsp;·&nbsp;{latest.durationLabel}{/if}
            </p>
            <h3 class="t-h3 mt-1.5">
              <a class="text-navy-900 hover:text-orange-700" href={latest.link} target="_blank" rel="noopener">
                {latest.title}
              </a>
            </h3>
            {#if latest.excerpt}
              <p class="mt-2 line-clamp-2 text-[0.97rem] leading-relaxed text-ink-soft">{latest.excerpt}</p>
            {/if}
            {#if latest.audioUrl}
              <div class="mt-4">
                <AudioPlayer src={latest.audioUrl} durationLabel={latest.durationLabel} />
              </div>
            {/if}
          </div>
        </div>
      </article>
    </div>
  </section>
{/if}
