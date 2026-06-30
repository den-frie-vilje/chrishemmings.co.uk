<!--
  Podcast episodes — DIRECTION A: "editorial rows".
  Text-forward list: small artwork thumb, date·duration eyebrow, title,
  two-line excerpt, and a "Play episode" affordance that reveals the
  native player on demand (keeps the list calm and uncluttered).
-->
<script lang="ts">
  import type { Episode } from '$lib/podcast';
  import AudioPlayer from '$lib/components/AudioPlayer.svelte';

  let { episodes }: { episodes: Episode[] } = $props();
</script>

<ul class="border-t border-line">
  {#each episodes as ep (ep.guid)}
    <li class="border-b border-line py-6">
      <div class="flex gap-5">
        <img
          src={ep.image}
          alt=""
          width="88"
          height="88"
          loading="lazy"
          class="hidden h-[88px] w-[88px] shrink-0 rounded-lg object-cover sm:block"
        />
        <div class="min-w-0 flex-1">
          <p class="t-eyebrow">
            {#if ep.dateLabel}{ep.dateLabel}{/if}{#if ep.durationLabel}&nbsp;·&nbsp;{ep.durationLabel}{/if}
          </p>
          <h3 class="t-h3 mt-1.5">
            <a class="text-navy-900 hover:text-orange-700" href={ep.link} target="_blank" rel="noopener">
              {ep.title}
            </a>
          </h3>
          {#if ep.excerpt}
            <p class="mt-2 line-clamp-2 text-[0.97rem] leading-relaxed text-ink-soft">{ep.excerpt}</p>
          {/if}

          {#if ep.audioUrl}
            <div class="mt-4 max-w-xl">
              <AudioPlayer src={ep.audioUrl} durationLabel={ep.durationLabel} />
            </div>
          {/if}
        </div>
      </div>
    </li>
  {/each}
</ul>
