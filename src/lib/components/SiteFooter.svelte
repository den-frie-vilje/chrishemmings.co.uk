<!--
  Site footer: navy surface, nav + contact + copyright. The booking CTA
  lives in <ContactSection>; the footer keeps to navigation + details.
-->
<script lang="ts">
  import { site, contact, footerNote, nav } from '$lib/content';
  import SocialIcon from '$lib/components/SocialIcon.svelte';

  // Build-time constant: the static build is rebuilt per deploy, so a
  // fixed year baked at prerender is fine and avoids a runtime `Date`.
  const year = 2026;

  // Nicely-cased platform names for accessible labels.
  const SOCIAL_LABELS: Record<string, string> = {
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    facebook: 'Facebook'
  };
</script>

<footer class="bg-navy-950 text-cloud">
  <div class="container-page grid gap-10 py-14 md:grid-cols-3">
    <div>
      <p class="font-extrabold tracking-[-0.02em] text-[1.15rem] text-paper">{site.name}</p>
      <p class="mt-2 max-w-xs text-sm text-cloud/80">{site.tagline}</p>

      {#if contact.social?.length}
        <ul class="mt-5 flex flex-wrap items-center gap-4">
          {#each contact.social as s (s.platform + s.url)}
            <li>
              <a
                class="inline-flex text-cloud/70 transition-colors hover:text-orange-300"
                href={s.url}
                target="_blank"
                rel="noopener"
                aria-label={`${site.name} on ${SOCIAL_LABELS[s.platform] ?? s.platform}`}
              >
                <SocialIcon platform={s.platform} class="h-5 w-5" />
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <nav aria-label="Footer">
      <p class="t-eyebrow !text-orange-300">Explore</p>
      <ul class="mt-3 space-y-2">
        {#each nav as item (item.href)}
          <li>
            <a class="text-[0.95rem] hover:text-orange-300" href={item.href}>{item.label}</a>
          </li>
        {/each}
      </ul>
    </nav>

    <div>
      <p class="t-eyebrow !text-orange-300">Contact</p>
      <ul class="mt-3 space-y-2 text-[0.95rem]">
        <li><a class="hover:text-orange-300" href={contact.emailHref}>{contact.email}</a></li>
        <li><a class="hover:text-orange-300" href={contact.phoneHref}>{contact.phone}</a></li>
      </ul>

      <!-- Find me on Men's Therapy Hub. The mark is an orange recolour of the
           transparent founder logo (CSS mask of its alpha), so no second
           asset and it tracks the orange token. -->
      <p class="t-eyebrow mt-6 !text-orange-300">Find me on</p>
      <a
        class="mth-link mt-3 inline-flex"
        href="https://menstherapyhub.co.uk/therapist/chris-hemmings/"
        target="_blank"
        rel="noopener"
        aria-label="Chris Hemmings' profile on Men's Therapy Hub"
      >
        <span class="mth-mark" aria-hidden="true"></span>
      </a>
    </div>
  </div>

  <div class="border-t border-white/10">
    <div class="container-page flex flex-col gap-1 py-5 text-xs text-cloud/70 sm:flex-row sm:justify-between">
      <p>{footerNote(year)}</p>
      <p>
        <a
          class="underline decoration-white/25 underline-offset-2 hover:text-orange-300"
          href={site.bacpRegisterUrl}
          target="_blank"
          rel="noopener"
        >
          BACP registered member
        </a>
        · Online worldwide
      </p>
    </div>
  </div>
</footer>

<style>
  /* Orange recolour of the monochrome MTH logo via its own alpha channel. */
  .mth-mark {
    display: block;
    width: 132px;
    height: 37px;
    /* Nudge left for optical alignment with the text above (the mark's own
       bounding box carries a little left whitespace). */
    margin-left: -3px;
    background-color: var(--color-orange-300);
    transition: background-color 0.15s ease;
    -webkit-mask: url('/img/logos/mth-mono.png') left center / contain no-repeat;
    mask: url('/img/logos/mth-mono.png') left center / contain no-repeat;
  }
  .mth-link:hover .mth-mark {
    background-color: var(--color-orange-500);
  }
</style>
