<script lang="ts">
  import { site, publicSpeaking as ps, testimonials } from '$lib/content';
  import { buildPageSeo } from '$lib/seo/structured-data';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import ContactSection from '$lib/components/ContactSection.svelte';
  import Testimonials from '$lib/components/Testimonials.svelte';
  import LogoCarousel from '$lib/components/LogoCarousel.svelte';
  import PlayPauseIcon from '$lib/components/PlayPauseIcon.svelte';
  import Prose from '$lib/components/Prose.svelte';

  const seo = buildPageSeo({
    path: '/public-speaking',
    title: `Public Speaking · ${site.name}`,
    description:
      'Keynote speaker and workshop facilitator on men’s mental health, masculinity and emotional wellbeing — for workplaces, schools, universities and conferences.'
  });

  const speakingHref = 'mailto:chrishemmings@live.co.uk?subject=Speaking enquiry';

  let orgsPaused = $state(false);
</script>

<SeoHead {seo} />

<!-- Hero -->
<section class="bg-navy-900 text-paper section-y">
  <div class="container-page grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
    <div>
      <p class="t-eyebrow !text-orange-300">{ps.hero.eyebrow}</p>
      <h1 class="t-display mt-4 text-paper">{ps.hero.title}</h1>
      <p class="mt-3 text-[1.1rem] font-semibold text-orange-300">{ps.hero.subtitle}</p>
      <p class="t-lead mt-5 max-w-xl text-cloud">{ps.hero.intro}</p>
      <div class="mt-8">
        <a class="btn btn-primary" href={speakingHref}>{ps.hero.cta}</a>
      </div>
    </div>
    <div class="md:justify-self-end">
      <img
        src={ps.hero.portrait}
        alt={ps.hero.portraitAlt}
        width="420"
        height="420"
        class="aspect-square w-full max-w-xs rounded-lg object-cover shadow-lg"
      />
    </div>
  </div>
</section>

<!-- Organisations worked with -->
<section class="bg-paper-2 border-b border-line py-12">
  <div class="container-page">
    <div class="flex items-center justify-center gap-2">
      <p class="t-eyebrow">{ps.orgsWorkedWith.title}</p>
      <button
        type="button"
        class="text-orange-700 transition-colors hover:text-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 motion-reduce:hidden"
        aria-pressed={orgsPaused}
        aria-label={orgsPaused ? 'Play logo animation' : 'Pause logo animation'}
        onclick={() => (orgsPaused = !orgsPaused)}
      >
        <PlayPauseIcon playing={!orgsPaused} size={14} />
      </button>
    </div>
    <div class="mt-6">
      <LogoCarousel
        logos={ps.orgsWorkedWith.logos}
        label={ps.orgsWorkedWith.title}
        bind:paused={orgsPaused}
      />
    </div>
  </div>
</section>

<!-- Experienced speaker -->
<section class="bg-paper section-y">
  <div class="container-page max-w-3xl">
    <h2 class="t-h2 text-ink">{ps.experienced.title}</h2>
    <Prose md={ps.experienced.body} class="mt-5" />
  </div>
</section>

<!-- My story -->
<section class="bg-sand section-y">
  <div class="container-page max-w-3xl">
    <h2 class="t-h2 text-ink">{ps.story.title}</h2>
    <Prose md={ps.story.body} class="mt-5" />
  </div>
</section>

<!-- Talks -->
<section class="bg-paper section-y">
  <div class="container-page">
    {#each ps.talks.groups as group, gi (group.name)}
      <h2 class="t-h2 text-ink {gi === 0 ? '' : 'mt-16'}">{group.name}</h2>
      <div class="mt-8 grid gap-6 lg:grid-cols-2">
        {#each group.items as talk (talk.title)}
          <article class="flex flex-col rounded-xl border border-line bg-paper-2 p-7">
            <h3 class="t-h3 text-navy-900">{talk.title}</h3>
            <Prose md={talk.body} class="mt-3 grow" />
            <p class="mt-5 border-t border-line pt-4 text-sm text-ink-soft">
              <span class="font-semibold text-ink">Popular with:</span>
              {talk.popularWith}
            </p>
          </article>
        {/each}
      </div>
    {/each}
    <div class="mt-10">
      <a class="btn btn-primary" href={speakingHref}>{ps.hero.cta}</a>
    </div>
  </div>
</section>

<Testimonials surface="paper" heading="What organisations say" items={testimonials.speaking} />

<ContactSection details={false} />
