<script lang="ts">
  import { site, home, booking, testimonials } from '$lib/content';
  import { buildPageSeo } from '$lib/seo/structured-data';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import ContactSection from '$lib/components/ContactSection.svelte';
  import Testimonials from '$lib/components/Testimonials.svelte';
  import HomePodcast from '$lib/components/HomePodcast.svelte';
  import Prose from '$lib/components/Prose.svelte';

  const seo = buildPageSeo({
    path: '/',
    title: `${site.name} — ${site.tagline} | Online Therapy`,
    ogTitle: `${site.name} — ${site.tagline}`,
    description:
      'Chris Hemmings is a psychotherapist and coach for men, offering online therapy across the UK, Europe and beyond. Book a free 15-minute consultation.'
  });

  const num = (i: number) => String(i + 1).padStart(2, '0');
</script>

<SeoHead {seo} />

<!-- Hero — Chris knocked out of his background, leaning in from the right
     (off-centre, bleeding off the edge) over the warm paper ground. The
     cutout is absolutely anchored to the section's bottom-right across all
     breakpoints. On mobile the hero fills the viewport (minus the 68px
     header) using `dvh`, so Chris rests on the *visible* bottom of the
     screen even as iOS Safari's toolbar expands/collapses; on md+ it's the
     usual side-by-side hero. -->
<section class="relative isolate overflow-hidden bg-paper">
  <!-- Off-axis radial wash, a touch darker behind Chris so the cutout lifts
       off the flat paper. Follows him bottom-right on mobile, mid-right on md+. -->
  <div class="hero-wash pointer-events-none absolute inset-0 z-0" aria-hidden="true"></div>

  <img
    src={home.hero.cutout}
    alt={home.hero.portraitAlt}
    width="1200"
    height="879"
    fetchpriority="high"
    class="pointer-events-none absolute bottom-0 right-0 z-0 select-none object-contain object-bottom
           w-[104%] max-w-[460px] translate-x-[10%]
           md:w-[58%] md:max-w-[620px] md:translate-x-[16%]
           lg:w-[52%] lg:max-w-[690px] lg:translate-x-[11%]"
  />
  <div
    class="container-page relative z-10 flex min-h-[calc(100dvh-68px)] flex-col pt-12
           md:min-h-[37rem] md:justify-center md:py-16"
  >
    <div class="max-w-xl">
      <p class="t-eyebrow">{home.hero.eyebrow}</p>
      <h1 class="t-display mt-4 text-ink">
        {home.hero.title}<span class="block text-ink-soft">{home.hero.titleAccent}</span>
      </h1>
      <p class="t-lead mt-6 max-w-xl text-ink-soft md:max-w-sm lg:max-w-xl">{home.hero.lead}</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a class="btn btn-primary" href={booking.href}>{home.hero.ctaPrimary}</a>
        <a class="btn btn-outline" href="/working-together">{home.hero.ctaSecondary}</a>
      </div>
    </div>
  </div>
</section>

<!-- Testimonial (featured therapy client) -->
<Testimonials
  variant="featured"
  surface="sand"
  eyebrow="Here's what one client had to say:"
  items={testimonials.therapy}
/>

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
      <div class="mt-6">
        <p class="t-eyebrow">{home.founder.intro}</p>
        <!-- Editorial: dark-green monochrome marks, left-aligned, no cards. -->
        <div class="mt-4 flex flex-wrap items-center gap-x-10 gap-y-5">
          {#each home.founder.orgs as org (org.name)}
            {#if org.href}
              <a
                href={org.href}
                target="_blank"
                rel="noopener"
                aria-label={org.name}
                class="transition-opacity hover:opacity-65"
              >
                <img src={org.logo} alt={`${org.name} logo`} class="h-10 w-auto" loading="lazy" />
              </a>
            {:else}
              <img src={org.logo} alt={`${org.name} logo`} class="h-10 w-auto" loading="lazy" />
            {/if}
          {/each}
        </div>
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

<!-- Latest podcast episode -->
<HomePodcast />

<!-- Public-speaking promo (secondary audience: workplaces). Warm sand
     surface so it reads distinct from the navy contact section below it. -->
<section class="bg-sand section-y">
  <div class="container-page grid items-center gap-8 md:grid-cols-[1.3fr_0.7fr]">
    <div>
      <p class="t-eyebrow">{home.speakingPromo.eyebrow}</p>
      <h2 class="t-h2 mt-3 text-ink">{home.speakingPromo.title}</h2>
      <p class="t-lead mt-4 max-w-2xl text-ink-soft">{home.speakingPromo.body}</p>
    </div>
    <div class="md:justify-self-end">
      <a class="btn btn-primary" href="/public-speaking">{home.speakingPromo.cta}</a>
    </div>
  </div>
</section>

<ContactSection />

<style>
  /* Warm off-axis wash behind Chris. It follows the cutout across
     breakpoints: bottom-right on small screens (where the cutout sits in
     flow), mid-right on md+ (behind the larger absolute cutout). */
  .hero-wash {
    background: radial-gradient(
      150% 90% at 76% 88%,
      color-mix(in srgb, #4a3826 26%, transparent) 0%,
      color-mix(in srgb, #4a3826 11%, transparent) 48%,
      transparent 88%
    );
  }
  @media (min-width: 768px) {
    .hero-wash {
      background: radial-gradient(
        120% 135% at 82% 56%,
        color-mix(in srgb, #4a3826 30%, transparent) 0%,
        color-mix(in srgb, #4a3826 12%, transparent) 45%,
        transparent 82%
      );
    }
  }
</style>
