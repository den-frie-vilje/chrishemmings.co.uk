<!--
  Podcast episodes — DIRECTION B: "cover cards".
  Visual grid: episode artwork leads each card with an orange play badge,
  date/duration chips, title, two-line excerpt, native player inline.
  More energetic / app-like than the editorial list.
-->
<script lang="ts">
  import type { Episode } from '$lib/podcast';

  let { episodes }: { episodes: Episode[] } = $props();
</script>

<ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {#each episodes as ep (ep.guid)}
    <li class="flex flex-col overflow-hidden rounded-xl border border-line bg-paper">
      <a class="relative block" href={ep.link} target="_blank" rel="noopener" aria-label={ep.title}>
        <img src={ep.image} alt="" loading="lazy" class="aspect-square w-full object-cover" />
        <span
          class="absolute bottom-3 left-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-navy-950 shadow-md"
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </span>
      </a>
      <div class="flex flex-1 flex-col p-5">
        <div class="flex flex-wrap gap-2">
          {#if ep.dateLabel}
            <span class="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-ink-soft">{ep.dateLabel}</span>
          {/if}
          {#if ep.durationLabel}
            <span class="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-ink-soft">{ep.durationLabel}</span>
          {/if}
        </div>
        <h3 class="t-h3 mt-3 text-navy-900">
          <a class="hover:text-orange-700" href={ep.link} target="_blank" rel="noopener">{ep.title}</a>
        </h3>
        {#if ep.excerpt}
          <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{ep.excerpt}</p>
        {/if}
        <audio class="mt-auto w-full pt-4" controls preload="none" src={ep.audioUrl}></audio>
      </div>
    </li>
  {/each}
</ul>
