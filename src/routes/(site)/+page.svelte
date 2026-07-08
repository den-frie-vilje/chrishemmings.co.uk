<script lang="ts">
  import { site, home, booking, testimonials, accolades } from '$lib/content';
  import { buildPageSeo } from '$lib/seo/structured-data';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import ContactSection from '$lib/components/ContactSection.svelte';
  import Testimonials from '$lib/components/Testimonials.svelte';
  import HomePodcast from '$lib/components/HomePodcast.svelte';
  import Accolades from '$lib/components/Accolades.svelte';
  import LogoCarousel from '$lib/components/LogoCarousel.svelte';
  import PlayPauseIcon from '$lib/components/PlayPauseIcon.svelte';
  import Photo from '$lib/components/Photo.svelte';
  import Prose from '$lib/components/Prose.svelte';

  // Pause/play state for the "featured in" press-logo marquee (WCAG 2.2.2).
  let featuredPaused = $state(false);

  const seo = buildPageSeo({
    path: '/',
    title: home.seo?.title ?? `${site.name} — ${site.tagline}`,
    description: home.seo?.description ?? site.description
  });

  const num = (i: number) => String(i + 1).padStart(2, '0');

  // whitespace-nowrap only suppresses breaks at spaces — Safari/Firefox
  // still treat hyphens/dashes as break opportunities. A zero-width word
  // joiner after each dash removes that opportunity in every engine.
  const noBreakDashes = (s: string) => s.replace(/([-\u2010\u2013\u2014])/g, '$1\u2060');

  // Areas-of-interest grid: pick a column count that divides the item count
  // evenly at each breakpoint, so the last row is always full — never an
  // orphaned card. (auto-fit/minmax can't guarantee this: 8 items in 3
  // columns leaves a 2-card orphan row.) `evenCols` returns the largest
  // divisor of n that is ≤ the breakpoint's cap.
  const evenCols = (n: number, cap: number): number => {
    for (let c = Math.min(cap, n); c >= 1; c--) if (n % c === 0) return c;
    return 1;
  };
  const interestCount = home.interests.items.length;
  const interestCols = {
    sm: evenCols(interestCount, 2),
    md: evenCols(interestCount, 3),
    lg: evenCols(interestCount, 4)
  };

  // Mobile hero cutout fade: when he loads badly cropped by the fold (only his
  // hair poking up, which looks comical) he starts transparent and fades up as
  // the page scrolls. The initial hide + scroll-linked fade are pure CSS
  // (scroll-driven `view()` timeline, mobile-only) so there's NO hydration
  // blink; this observer just *latches* it — once he's ≥ half in view we lock
  // him opaque so scrolling back to the top can't re-hide him. On viewports
  // where he already loads mostly in view, it fires immediately → no fade.
  let heroCutout = $state<HTMLImageElement>();
  let heroRevealed = $state(false);
  $effect(() => {
    const img = heroCutout;
    if (!img) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.intersectionRatio >= 0.5) {
            heroRevealed = true;
            io.disconnect();
          }
        }
      },
      { threshold: [0.5] }
    );
    io.observe(img);
    return () => io.disconnect();
  });
</script>

<SeoHead {seo} />

<!-- Hero — Chris knocked out of his background over the warm paper ground.
     md+ : cutout absolutely anchored to the section's bottom-right, beside
     the copy. Mobile : the hero fills the viewport (minus the 68px header)
     via `dvh`, and the cutout sits IN FLOW below the copy with `mt-auto` —
     so it rests on the visible bottom when there's room but drops below the
     copy on a short screen, guaranteeing the CTAs never overlap the photo. -->
<section class="relative isolate bg-paper md:overflow-hidden">
  <!-- Off-axis radial wash, a touch darker behind Chris so the cutout lifts
       off the flat paper. Follows him bottom-right on mobile, mid-right on md+. -->
  <div class="hero-wash pointer-events-none absolute inset-0 z-0" aria-hidden="true"></div>

  <!-- md+ : absolute, anchored right. While the container fills the viewport he
       hugs (and slightly bleeds past) the right edge; once the viewport is wider
       than the container he settles onto the container's right margin instead of
       following the viewport — see .hero-cutout-desktop in <style>. -->
  <img
    src={home.hero.cutout}
    alt={home.hero.portraitAlt}
    width="1200"
    height="879"
    fetchpriority="high"
    class="hero-cutout-desktop pointer-events-none absolute bottom-0 z-0 hidden select-none object-contain object-bottom
           md:block md:w-[58%] md:max-w-[620px]
           lg:w-[52%] lg:max-w-[690px]"
  />
  <div
    class="container-page relative z-10 flex min-h-[calc(100dvh-68px)] flex-col pt-12
           md:min-h-[37rem] md:py-[clamp(48px,8vw,var(--spacing-section))]"
  >
    <div class="mb-8 max-w-xl md:mb-0">
      <p class="t-eyebrow">{home.hero.eyebrow}</p>
      <h1 class="t-display mt-4 text-ink">
        {home.hero.title}<span class="block text-ink-soft">{home.hero.titleAccent}</span>
      </h1>
      <p class="t-lead mt-6 max-w-xl text-ink-soft md:max-w-sm lg:max-w-xl">{home.hero.lead}</p>
      {#if home.hero.credentials?.length}
        <!-- Eyebrow-sized; #527183 is the lightest ink-soft tint that still
             clears WCAG AA (4.6:1) on paper — don't lighten further. Each
             credit is a nowrap span with its trailing "|" attached, so lines
             break only after a separator — never inside a credit. -->
        <p
          class="mt-4 max-w-xl text-[0.78rem] font-medium tracking-[0.05em] text-[#527183] uppercase md:max-w-sm lg:max-w-xl"
        >
          {#each home.hero.credentials as credential, i}
            {#if i > 0}{' '}{/if}<span class="whitespace-nowrap"
              >{noBreakDashes(credential)}{#if i < home.hero.credentials.length - 1}<span
                aria-hidden="true"
                  >{' |'}</span
                >{/if}</span
            >
          {/each}
        </p>
      {/if}
      <div class="mt-8 flex flex-wrap gap-3">
        <a class="btn btn-primary" href={booking.href}>{home.hero.ctaPrimary}</a>
        <a class="btn btn-outline" href="/working-together">{home.hero.ctaSecondary}</a>
      </div>
    </div>

    <!-- mobile : full-bleed to the viewport (breaks out of the container
         padding) so he crops at the screen edges, not the margins. Grows to
         fill the room under the copy (flex-1) and rests on the bottom; the
         min-h floor keeps the box portrait-ish so there's always a side crop
         — object-position then holds him a touch right of centre. -->
    <img
      bind:this={heroCutout}
      src={home.hero.cutout}
      alt={home.hero.portraitAlt}
      width="1200"
      height="879"
      class:is-revealed={heroRevealed}
      class="hero-cutout mt-3 ml-[calc(50%-50vw)] min-h-[100vw] w-screen max-w-none flex-1 select-none object-cover object-[8%_bottom] md:hidden"
    />
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
      <Photo
        src={home.about.photo}
        alt={home.about.photoAlt}
        class="aspect-[4/5] w-full rounded-lg object-cover shadow-md"
        sizes="(min-width: 768px) 40vw, 100vw"
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
                <img
                  src={org.logo}
                  alt={`${org.name} logo`}
                  class="h-[clamp(2.5rem,11vw,3rem)] w-auto lg:h-14"
                  loading="lazy"
                />
              </a>
            {:else}
              <img
                src={org.logo}
                alt={`${org.name} logo`}
                class="h-[clamp(2.5rem,11vw,3rem)] w-auto lg:h-14"
                loading="lazy"
              />
            {/if}
          {/each}
        </div>
      </div>
      <Accolades items={accolades} class="mt-8" />
    </div>
  </div>
</section>

<!-- Areas of interest -->
<section class="bg-paper-2 section-y">
  <div class="container-page">
    <h2 class="t-h2 text-ink">{home.interests.title}</h2>
    <p class="t-lead mt-3 max-w-2xl text-ink-soft">{home.interests.intro}</p>

    {#if home.interests.items.length}
      <!-- Column count divides the item count evenly at every breakpoint (see
           `evenCols`), so the last row is always full — no orphaned cards. -->
      <ul
        class="interests-grid mt-10 grid gap-5"
        style="--sm-cols:{interestCols.sm}; --md-cols:{interestCols.md}; --lg-cols:{interestCols.lg}"
      >
        {#each home.interests.items as item, i (item.title)}
          <li class="rounded-lg border border-line bg-paper p-6">
            <span class="font-serif text-2xl text-orange-700" aria-hidden="true">{num(i)}</span>
            <h3 class="t-h3 mt-2 text-navy-900">{item.title}</h3>
            <p class="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{item.body}</p>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>

<!-- Press / media Chris's work has featured in — reuses the scrolling logo
     marquee (with the keyboard-focusable pause/play control per WCAG 2.2.2). -->
{#if home.featuredIn.logos.length}
  <section class="bg-sand py-9">
    <div class="container-page">
      <div class="flex items-center justify-center gap-2">
        <p class="t-eyebrow">{home.featuredIn.title}</p>
        <button
          type="button"
          class="text-orange-700 transition-colors hover:text-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 motion-reduce:hidden"
          aria-pressed={featuredPaused}
          aria-label={featuredPaused ? 'Play logo animation' : 'Pause logo animation'}
          onclick={() => (featuredPaused = !featuredPaused)}
        >
          <PlayPauseIcon playing={!featuredPaused} size={14} />
        </button>
      </div>
      <div class="mt-6">
        <LogoCarousel
          logos={home.featuredIn.logos}
          label={home.featuredIn.title}
          variant="strip"
          bind:paused={featuredPaused}
        />
      </div>
    </div>
  </section>
{/if}

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
  /* Areas-of-interest grid: fixed, breakpoint-specific column counts (set
     via CSS vars from `evenCols`) rather than auto-fit, so the number of
     columns always divides the item count — the last row never orphans. */
  .interests-grid {
    grid-template-columns: 1fr;
  }
  @media (min-width: 640px) {
    .interests-grid {
      grid-template-columns: repeat(var(--sm-cols, 2), minmax(0, 1fr));
    }
  }
  @media (min-width: 768px) {
    .interests-grid {
      grid-template-columns: repeat(var(--md-cols, 2), minmax(0, 1fr));
    }
  }
  @media (min-width: 1024px) {
    .interests-grid {
      grid-template-columns: repeat(var(--lg-cols, 4), minmax(0, 1fr));
    }
  }

  /* Desktop hero cutout horizontal anchor. While the container fills the
     viewport (≤ its 1160px max-width) the side margin is 0, so `right`
     resolves to a small negative — he hugs and slightly bleeds past the
     viewport's right edge (the look we want, cropped by md:overflow-hidden).
     Once the viewport is wider than the container, margins open up and `right`
     grows to the margin width, pinning his right edge to the container's right
     margin — he stops following the viewport and the shoulder is fully shown.
     The bleed tapers off as the margin opens so there's no jump at 1160px. */
  @media (min-width: 768px) {
    .hero-cutout-desktop {
      --container-w: 1160px;
      --bleed: 66px;
      --side-margin: max(0px, (100vw - var(--container-w)) / 2);
      right: calc(var(--side-margin) - max(0px, var(--bleed) - var(--side-margin)));
    }
  }

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
    /* Keep the wash off the copy: measured on-screen, its tail darkened the
       paper under the hero text enough to drop ink-soft below WCAG AA
       (4.21:1 eyebrow / 3.68:1 at 1280px). The mask fades the wash in only
       over the cutout zone — below the copy on mobile, right of it on md+ —
       so text always sits on full-contrast paper. */
    mask-image: linear-gradient(to bottom, transparent 48%, black 72%);
  }
  @media (min-width: 768px) {
    .hero-wash {
      background: radial-gradient(
        120% 135% at 82% 56%,
        color-mix(in srgb, #4a3826 30%, transparent) 0%,
        color-mix(in srgb, #4a3826 12%, transparent) 45%,
        transparent 82%
      );
      mask-image: linear-gradient(to right, transparent 52%, black 70%);
    }
  }

  /* Mobile hero cutout: scroll-driven fade so he isn't a comical hair-tuft
     when he loads far below the fold. Pure CSS (`view()` timeline) → applied
     from the first paint, so there's NO hydration blink; he's opacity 1 once
     ≳ half in view, fading toward 0 the more he's cropped by the fold. Mobile
     only (the md+ cutout is a separate element). Progressive enhancement:
     browsers without scroll-driven animations just show him. The
     IntersectionObserver adds `.is-revealed` to latch him opaque once he's
     been seen, so scrolling back to the top can't re-hide him. */
  @keyframes hero-cutout-reveal {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @supports (animation-timeline: view()) {
    @media (max-width: 767px) {
      .hero-cutout {
        opacity: 0;
        animation: hero-cutout-reveal linear both;
        animation-timeline: view();
        animation-range: entry 35% entry 50%;
      }
      .hero-cutout.is-revealed {
        opacity: 1;
        animation: none;
      }
    }
  }
</style>
