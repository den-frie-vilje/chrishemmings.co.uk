<script lang="ts">
  import { site, getInTouch } from '$lib/content';
  import { buildPageSeo } from '$lib/seo/structured-data';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import ContactSection from '$lib/components/ContactSection.svelte';
  import Prose from '$lib/components/Prose.svelte';

  const seo = buildPageSeo({
    path: '/get-in-touch',
    title: `Get in touch · ${site.name}`,
    description:
      'Get in touch with Chris Hemmings by email, phone or text, or book a free 15-minute consultation to see how we might work together.'
  });
</script>

<SeoHead {seo} />

<section class="bg-paper section-y">
  <div class="container-page max-w-2xl">
    <h1 class="t-display text-ink text-center">{getInTouch.heading}</h1>
    <p class="t-lead mt-5 text-center text-ink-soft">{getInTouch.intro}</p>
    {#if getInTouch.body}
      <Prose md={getInTouch.body} class="mt-8" />
    {/if}
  </div>
</section>

<!-- What happens next — reduces first-timer uncertainty without repeating
     the contact details below. -->
<section class="bg-paper-2 section-y">
  <div class="container-page">
    <h2 class="t-h2 text-center text-ink">{getInTouch.whatToExpect.title}</h2>
    <ol class="mt-10 grid gap-5 sm:grid-cols-3">
      {#each getInTouch.whatToExpect.steps as step, i (step.title)}
        <li class="rounded-xl border border-line bg-paper p-6">
          <span class="font-serif text-2xl text-orange-700" aria-hidden="true">{i + 1}</span>
          <h3 class="t-h3 mt-2 text-navy-900">{step.title}</h3>
          <p class="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{step.body}</p>
        </li>
      {/each}
    </ol>

    {#if getInTouch.reassurances.length}
      <ul class="mt-8 flex flex-wrap justify-center gap-3">
        {#each getInTouch.reassurances as r (r)}
          <li
            class="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-1.5 text-sm text-ink-soft"
          >
            <svg class="h-4 w-4 shrink-0 text-orange-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {r}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>

<!-- Overarching contact details + booking CTA (general collection). -->
<ContactSection />
