<!--
  Sticky site header: navy surface, wordmark left, nav + primary CTA
  right. Gradual collapse, no wrapping — links drop into the burger by
  priority as width shrinks:
    • < navtight (<608px): hamburger only;
    • navtight–navmini (608–720px): Therapy & Public + partial burger;
    • navmini–md (720–768px): + Get in touch;
    • md–navfull (768–928px): all five links, burger off, CTA hidden;
    • navfull+ (≥928px): all five links + the "Free consultation" CTA.
-->
<script lang="ts">
  import { page } from '$app/state';
  import { site, booking, nav } from '$lib/content';

  let open = $state(false);
  let toggleBtn = $state<HTMLButtonElement>();
  let mobileNav = $state<HTMLElement>();

  const current = $derived(page.url.pathname);
  function isActive(href: string): boolean {
    return href === '/' ? current === '/' : current.startsWith(href);
  }
  function close() {
    open = false;
  }
  // Esc closes the overlay and returns focus to the toggle (2.1.2 / 2.4.3).
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      open = false;
      toggleBtn?.focus();
    }
  }
  // When the overlay opens, move focus into it so keyboard/AT users land on
  // the menu rather than continuing behind it.
  $effect(() => {
    if (open) mobileNav?.querySelector<HTMLAnchorElement>('a')?.focus();
  });

  // Per-link inline visibility, by priority. Therapy & Public stay inline
  // longest (from navtight); Get in touch joins at navmini; Home (the logo
  // already links home) and Podcast at md. Anything hidden lives in the
  // burger, which is present below md.
  const LINK_VIS: Record<string, string> = {
    '/working-together': '',
    '/public-speaking': '',
    '/get-in-touch': 'hidden navmini:inline'
  };
  const linkVisibility = (href: string) => LINK_VIS[href] ?? 'hidden md:inline';
</script>

<svelte:window onkeydown={onKeydown} />

<header class="sticky top-0 z-50 bg-navy-900 text-paper">
  <div class="container-page flex h-[68px] items-center justify-between gap-4">
    <a
      href="/"
      class="font-extrabold tracking-[-0.02em] text-[1.2rem] leading-none text-paper"
      onclick={close}
    >
      {site.name}
    </a>

    <!-- Desktop nav -->
    <nav class="hidden flex-nowrap items-center gap-6 whitespace-nowrap navtight:flex" aria-label="Primary">
      {#each nav as item (item.href)}
        <a
          href={item.href}
          class="text-[0.93rem] font-medium transition-colors hover:text-orange-300 {linkVisibility(
            item.href
          )}"
          class:text-orange-300={isActive(item.href)}
          aria-current={isActive(item.href) ? 'page' : undefined}
        >
          {item.label}
        </a>
      {/each}
      <!-- CTA hidden in the cramped md–navfull range; reappears at navfull. -->
      <span class="hidden navfull:block">
        <a href={booking.href} class="btn btn-primary !py-2.5 !px-4 text-[0.9rem]">
          Free consultation
        </a>
      </span>
    </nav>

    <!-- Mobile toggle -->
    <button
      bind:this={toggleBtn}
      class="md:hidden inline-flex h-10 w-10 items-center justify-center rounded text-paper"
      aria-expanded={open}
      aria-controls="mobile-nav"
      aria-label={open ? 'Close menu' : 'Open menu'}
      onclick={() => (open = !open)}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {#if open}
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        {:else}
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        {/if}
      </svg>
    </button>
  </div>

  <!-- Mobile overlay menu -->
  {#if open}
    <nav
      bind:this={mobileNav}
      id="mobile-nav"
      class="md:hidden border-t border-white/10 bg-navy-900"
      aria-label="Primary"
    >
      <ul class="container-page flex flex-col py-3">
        {#each nav as item (item.href)}
          <li>
            <a
              href={item.href}
              class="block py-3 text-[1.05rem] font-medium"
              class:text-orange-300={isActive(item.href)}
              aria-current={isActive(item.href) ? 'page' : undefined}
              onclick={close}
            >
              {item.label}
            </a>
          </li>
        {/each}
        <li class="pt-3">
          <a
            href={booking.href}
            class="btn btn-primary w-full"
            onclick={close}
          >
            {booking.label}
          </a>
        </li>
      </ul>
    </nav>
  {/if}
</header>
