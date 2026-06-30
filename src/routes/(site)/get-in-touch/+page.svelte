<script lang="ts">
  import { site, getInTouch } from '$lib/content';
  import { buildPageSeo } from '$lib/seo/structured-data';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import ContactSection from '$lib/components/ContactSection.svelte';

  const seo = buildPageSeo({
    path: '/get-in-touch',
    title: `Get in touch · ${site.name}`,
    description:
      'Get in touch about therapy and coaching for men, or to book Chris Hemmings to speak or run a workshop. Free 15-minute consultation for new clients.'
  });
</script>

<SeoHead {seo} />

<!-- Hero — addresses both audiences (individuals + organisations). -->
<section class="bg-paper section-y">
  <div class="container-page max-w-2xl text-center">
    <h1 class="t-display text-ink">{getInTouch.heading}</h1>
    <p class="t-lead mt-5 text-ink-soft">{getInTouch.intro}</p>
  </div>
</section>

<!-- Two enquiry paths: therapy/coaching (individuals) and speaking/workshops
     (organisations), each with its own CTA so neither audience feels like an
     afterthought. -->
<section class="bg-paper-2 section-y">
  <div class="container-page">
    <div class="grid gap-5 md:grid-cols-2">
      {#each getInTouch.paths as path (path.title)}
        <div class="flex flex-col rounded-xl border border-line bg-paper p-7 md:p-8">
          <p class="t-eyebrow">{path.eyebrow}</p>
          <h2 class="t-h3 mt-3 text-navy-900">{path.title}</h2>
          <p class="mt-3 text-[1.02rem] leading-relaxed text-ink-soft">{path.body}</p>
          <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a class="btn btn-primary" href={path.ctaHref}>{path.ctaLabel}</a>
            <a class="font-medium text-blue-600 underline-offset-2 hover:underline" href={path.linkHref}>
              {path.linkLabel} →
            </a>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- What happens next — scoped to therapy/coaching enquiries so it doesn't
     read as the whole page. Reduces first-timer uncertainty. -->
<section class="bg-paper section-y">
  <div class="container-page">
    <p class="t-eyebrow text-center">{getInTouch.whatToExpect.eyebrow}</p>
    <h2 class="t-h2 mt-3 text-center text-ink">{getInTouch.whatToExpect.title}</h2>
    <ol class="mt-10 grid gap-5 sm:grid-cols-3">
      {#each getInTouch.whatToExpect.steps as step, i (step.title)}
        <li class="rounded-xl border border-line bg-paper-2 p-6">
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
            class="inline-flex items-center gap-2 rounded-full border border-line bg-paper-2 px-4 py-1.5 text-sm text-ink-soft"
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
