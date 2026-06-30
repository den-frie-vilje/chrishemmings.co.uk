<script lang="ts">
  import { site, contact } from '$lib/content';
  import { buildPageSeo } from '$lib/seo/structured-data';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import ContactSection from '$lib/components/ContactSection.svelte';

  const seo = buildPageSeo({
    path: '/get-in-touch',
    title: `Get in touch · ${site.name}`,
    description:
      'Get in touch with Chris Hemmings by email, phone or text, or book a free 15-minute consultation to see how we might work together.'
  });
</script>

<SeoHead {seo} />

<section class="bg-paper section-y">
  <div class="container-page max-w-2xl text-center">
    <h1 class="t-display text-ink">{contact.heading}</h1>
    <p class="t-lead mt-5 text-ink-soft">{contact.intro}</p>
  </div>
</section>

<ContactSection />
