<!--
  Editorial accolades list (sister to Testimonials) — awards / named-list
  recognitions from `src/content/accolades.json`. Magazine-style: a small
  eyebrow, hairline-ruled rows, the accolade name set in the Newsreader
  serif with a muted year · body meta line. Linked rows open the source in
  a new tab. `tone` adapts it to a light (paper) or dark (navy) ground.
  Renders nothing when the list is empty.
-->
<script lang="ts">
  import type { Accolade } from '$lib/content';

  interface Props {
    items: Accolade[];
    tone?: 'light' | 'dark';
    heading?: string;
    class?: string;
  }
  let { items, tone = 'light', heading = 'Recognition', class: klass = '' }: Props = $props();

  const c = $derived(
    tone === 'dark'
      ? {
          eyebrow: 'text-orange-300',
          rule: 'border-white/15',
          title: 'text-paper',
          meta: 'text-cloud',
          hover: 'group-hover:text-orange-300'
        }
      : {
          eyebrow: 'text-orange-700',
          rule: 'border-line',
          title: 'text-navy-900',
          meta: 'text-ink-soft',
          hover: 'group-hover:text-orange-700'
        }
  );
</script>

{#if items.length}
  <div class={klass}>
    <p class="t-eyebrow {c.eyebrow}">{heading}</p>
    <ul class="mt-4 border-t {c.rule}">
      {#each items as a (a.title + (a.year ?? ''))}
        {#snippet body()}
          <p class="font-serif text-[1.35rem] leading-tight transition-colors {c.title} {a.href
              ? c.hover
              : ''}">
            {a.title}
          </p>
          <p class="mt-1 text-sm {c.meta}">
            {#if a.year}<span class="tabular-nums">{a.year}</span> · {/if}{a.org}{#if a.href}<svg
                class="ml-1.5 inline-block h-3 w-3 align-[-1px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              ><path d="M7 17L17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round" /></svg
              >{/if}
          </p>
        {/snippet}
        <li class="border-b {c.rule}">
          {#if a.href}
            <a
              href={a.href}
              target="_blank"
              rel="noopener"
              class="group block py-4"
              aria-label={`${a.title}${a.year ? ` (${a.year})` : ''}, ${a.org} — opens the source in a new tab`}
            >
              {@render body()}
            </a>
          {:else}
            <div class="py-4">{@render body()}</div>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}
