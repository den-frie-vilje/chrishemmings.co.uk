<script lang="ts">
  import { site, workingTogether as wt, booking, testimonials } from '$lib/content';
  import { buildPageSeo } from '$lib/seo/structured-data';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import ContactSection from '$lib/components/ContactSection.svelte';
  import Testimonials from '$lib/components/Testimonials.svelte';
  import Photo from '$lib/components/Photo.svelte';
  import Prose from '$lib/components/Prose.svelte';

  const seo = buildPageSeo({
    path: '/working-together',
    title: wt.seo?.title ?? `${site.name} — ${site.tagline}`,
    description: wt.seo?.description ?? site.description
  });
</script>

<SeoHead {seo} />

<!-- Hero -->
<section class="relative isolate overflow-hidden bg-navy-900 text-paper section-y">
  <div class="navy-wash-r pointer-events-none absolute inset-0 z-0" aria-hidden="true"></div>
  <div class="container-page relative z-10 grid items-start gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
    <div>
      <p class="t-eyebrow !text-orange-300">{wt.hero.eyebrow}</p>
      <h1 class="t-display mt-4 text-paper">{wt.hero.title}</h1>
      <p class="t-lead mt-5 text-cloud">{wt.hero.subtitle}</p>
      <div class="mt-8">
        <a class="btn btn-primary" href={booking.href}>{booking.label}</a>
      </div>
    </div>
    <div class="md:justify-self-end">
      <Photo
        src={wt.hero.portrait}
        alt={wt.hero.portraitAlt}
        class="aspect-[4/5] w-full max-w-sm rounded-lg object-cover shadow-lg"
        sizes="(min-width: 768px) 384px, 100vw"
        loading="eager"
        fetchpriority="high"
      />
    </div>
  </div>
</section>

<!-- Intro / how I work — headings (h2/h3) live in the markdown itself. -->
<section class="bg-paper section-y">
  <div class="container-page max-w-3xl">
    <Prose md={wt.intro} />
  </div>
</section>

<!-- Qualifications -->
<section class="bg-sand section-y">
  <div class="container-page grid gap-10 md:grid-cols-[1fr_0.8fr] md:items-start">
    <div>
      <h2 class="t-h2 text-ink">{wt.qualifications.title}</h2>
      <ul class="mt-6 space-y-3">
        {#each wt.qualifications.items as item (item)}
          <li class="flex gap-3 text-[1.02rem] text-ink">
            <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" aria-hidden="true"></span>
            <span>{item}</span>
          </li>
        {/each}
      </ul>
      <p class="mt-5 text-sm text-ink-soft">{wt.qualifications.regulatorNote}</p>
    </div>
    <div class="flex flex-wrap items-center gap-4 md:justify-end">
      <a
        class="flex h-20 items-center justify-center rounded-lg border border-line bg-white px-6 transition-shadow hover:shadow-md"
        href={site.bacpRegisterUrl}
        target="_blank"
        rel="noopener"
        aria-label="Verify Chris Hemmings on the BACP register"
      >
        <img
          src="/img/bacp.png"
          alt="BACP — British Association for Counselling and Psychotherapy"
          class="max-h-11 w-auto"
          loading="lazy"
        />
      </a>
      <span class="flex h-20 items-center justify-center rounded-lg border border-line bg-white px-6">
        <img
          src="/img/professional-standards-authority.png"
          alt="Professional Standards Authority accredited register"
          class="max-h-14 w-auto"
          loading="lazy"
        />
      </span>
    </div>
  </div>
</section>

<!-- Fees — an editable list of fee cards (e.g. therapy, coaching). -->
<section class="bg-paper section-y">
  <div class="container-page max-w-3xl">
    <p class="t-eyebrow">{wt.fees.eyebrow}</p>
    <div class="mt-4 space-y-5">
      {#each wt.fees.items as fee (fee.title)}
        <div class="rounded-xl border border-line bg-paper-2 p-7 md:p-9">
          <h3 class="t-h3 text-navy-900">{fee.title}</h3>
          <p
            class="mt-3 font-extrabold leading-none text-navy-900 text-[clamp(30px,5vw,46px)] tracking-[-0.03em]"
          >
            {fee.range}
            <span class="mt-2 block text-base font-medium tracking-normal text-ink-soft">{fee.unit}</span>
          </p>
          <Prose md={fee.body} class="mt-6" />
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Further information -->
<section class="bg-paper-2 section-y">
  <div class="container-page max-w-3xl">
    <h2 class="t-h2 text-ink">{wt.furtherInfo.title}</h2>
    <Prose md={wt.furtherInfo.body} class="mt-5" />
  </div>
</section>

<Testimonials surface="sand" heading="What clients say" items={testimonials.therapy} />

<ContactSection />
