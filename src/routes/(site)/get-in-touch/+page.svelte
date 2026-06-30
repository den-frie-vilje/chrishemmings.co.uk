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

<!-- Overarching contact details + booking CTA (general collection). -->
<ContactSection />
