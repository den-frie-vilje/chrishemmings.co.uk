<script lang="ts">
  import { site, home, contact } from '$lib/content';
  import { buildPageSeo } from '$lib/seo/structured-data';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import ContactSection from '$lib/components/ContactSection.svelte';
  import Prose from '$lib/components/Prose.svelte';

  const seo = buildPageSeo({
    path: '/',
    title: `${site.name} — ${site.tagline} | Online Therapy`,
    ogTitle: site.name,
    description:
      'Chris Hemmings is a psychotherapist and coach for men, offering online therapy across the UK, Europe and beyond. Book a free 15-minute consultation.'
  });

  const num = (i: number) => String(i + 1).padStart(2, '0');
</script>

<SeoHead {seo} />

<!-- Hero -->
<section class="bg-paper section-y">
  <div class="container-page grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
    <div>
      <p class="t-eyebrow">{home.hero.eyebrow}</p>
      <h1 class="t-display mt-4 text-ink">{home.hero.title}</h1>
      <p class="t-lead mt-6 max-w-xl text-ink-soft">{home.hero.lead}</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a class="btn btn-primary" href={contact.booking.href}>{home.hero.ctaPrimary}</a>
        <a class="btn btn-outline" href="/working-together">{home.hero.ctaSecondary}</a>
      </div>
    </div>
    <div class="md:justify-self-end">
      <img
        src="/img/chris-hero.jpg"
        alt={home.hero.portraitAlt}
        width="520"
        height="600"
        class="aspect-[5/6] w-full max-w-sm rounded-lg object-cover shadow-lg md:max-w-md"
        fetchpriority="high"
      />
    </div>
  </div>
</section>

<!-- Testimonial -->
<section class="bg-sand section-y">
  <div class="container-page mx-auto max-w-3xl text-center">
    <p class="t-eyebrow">{home.testimonial.lead}</p>
    <blockquote class="mt-5 font-serif text-[clamp(22px,3vw,32px)] italic leading-snug text-navy-900">
      “{home.testimonial.quote}”
    </blockquote>
    <p class="mt-5 text-sm font-semibold tracking-wide text-ink-soft">— {home.testimonial.attribution}</p>
  </div>
</section>

<!-- About -->
<section class="bg-paper section-y">
  <div class="container-page grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-14">
    <div class="md:order-2">
      <h2 class="t-h2 text-ink">{home.about.title}</h2>
      <Prose md={home.about.body} class="mt-5" />
    </div>
    <div class="md:order-1">
      <img
        src="/img/chris-working.jpg"
        alt="Chris Hemmings, psychotherapist & coach"
        width="460"
        height="560"
        class="aspect-[4/5] w-full rounded-lg object-cover shadow-md"
        loading="lazy"
      />
      <div class="mt-8">
        <p class="t-eyebrow">{home.founder.intro}</p>
        <ul class="mt-4 flex flex-wrap items-center gap-6">
          {#each home.founder.orgs as org (org.name)}
            <li>
              {#if org.href}
                <a href={org.href} target="_blank" rel="noopener" aria-label={org.name}>
                  <img src={org.logo} alt={`${org.name} logo`} class="h-14 w-auto" loading="lazy" />
                </a>
              {:else}
                <img src={org.logo} alt={`${org.name} logo`} class="h-14 w-auto" loading="lazy" />
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- Areas of interest -->
<section class="bg-paper-2 section-y">
  <div class="container-page">
    <h2 class="t-h2 text-ink">{home.interests.title}</h2>
    <p class="t-lead mt-3 max-w-2xl text-ink-soft">{home.interests.intro}</p>

    <ul class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {#each home.interests.items as item, i (item.title)}
        <li class="rounded-lg border border-line bg-paper p-6">
          <span class="font-serif text-2xl text-orange-700" aria-hidden="true">{num(i)}</span>
          <h3 class="t-h3 mt-2 text-navy-900">{item.title}</h3>
          <p class="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{item.body}</p>
        </li>
      {/each}
    </ul>
  </div>
</section>

<ContactSection />
