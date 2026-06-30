<script lang="ts">
  import { site, workingTogether as wt, contact, testimonials } from '$lib/content';
  import { buildPageSeo } from '$lib/seo/structured-data';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import ContactSection from '$lib/components/ContactSection.svelte';
  import Testimonials from '$lib/components/Testimonials.svelte';
  import Prose from '$lib/components/Prose.svelte';

  const seo = buildPageSeo({
    path: '/working-together',
    title: `Therapy & Coaching · ${site.name}`,
    description:
      'How I work: person-centred, collaborative therapy and coaching for men. Training, qualifications and a sliding-scale fee of £95–£145 per session.'
  });
</script>

<SeoHead {seo} />

<!-- Hero -->
<section class="bg-navy-900 text-paper section-y">
  <div class="container-page grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
    <div>
      <p class="t-eyebrow !text-orange-300">{wt.hero.eyebrow}</p>
      <h1 class="t-display mt-4 text-paper">{wt.hero.title}</h1>
      <p class="t-lead mt-5 text-cloud">{wt.hero.subtitle}</p>
      <div class="mt-8">
        <a class="btn btn-primary" href={contact.booking.href}>{contact.booking.label}</a>
      </div>
    </div>
    <div class="md:justify-self-end">
      <img
        src={wt.hero.portrait}
        alt={wt.hero.portraitAlt}
        width="460"
        height="560"
        class="aspect-[4/5] w-full max-w-sm rounded-lg object-cover shadow-lg"
      />
    </div>
  </div>
</section>

<!-- Intro / how I work -->
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
    <div class="flex flex-wrap items-center gap-6 md:justify-end">
      <img src="/img/bacp.png" alt="BACP — British Association for Counselling and Psychotherapy" class="h-16 w-auto" loading="lazy" />
      <img src="/img/professional-standards-authority.png" alt="Professional Standards Authority accredited register" class="h-20 w-auto" loading="lazy" />
    </div>
  </div>
</section>

<!-- Fees -->
<section class="bg-paper section-y">
  <div class="container-page max-w-3xl">
    <p class="t-eyebrow">{wt.fees.eyebrow}</p>
    <div class="mt-4 rounded-xl border border-line bg-paper-2 p-7 md:p-9">
      <p class="font-extrabold leading-none text-navy-900 text-[clamp(30px,5vw,46px)] tracking-[-0.03em]">
        {wt.fees.range}
        <span class="block text-base font-medium tracking-normal text-ink-soft mt-2">{wt.fees.unit}</span>
      </p>
      <Prose md={wt.fees.body} class="mt-6" />
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
