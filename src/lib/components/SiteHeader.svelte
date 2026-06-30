<!--
  Sticky site header: navy surface, wordmark left, nav + primary CTA
  right. Collapses to a hamburger-toggled overlay menu below `md`.
-->
<script lang="ts">
  import { page } from '$app/state';
  import { site, contact } from '$lib/content';

  let open = $state(false);

  const current = $derived(page.url.pathname);
  function isActive(href: string): boolean {
    return href === '/' ? current === '/' : current.startsWith(href);
  }
  function close() {
    open = false;
  }
</script>

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
    <nav class="hidden items-center gap-7 md:flex" aria-label="Primary">
      {#each site.nav as item (item.href)}
        <a
          href={item.href}
          class="text-[0.93rem] font-medium transition-colors hover:text-orange-300"
          class:text-orange-300={isActive(item.href)}
          aria-current={isActive(item.href) ? 'page' : undefined}
        >
          {item.label}
        </a>
      {/each}
      <a href={contact.booking.href} class="btn btn-primary !py-2.5 !px-4 text-[0.9rem]">
        Free consultation
      </a>
    </nav>

    <!-- Mobile toggle -->
    <button
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
      id="mobile-nav"
      class="md:hidden border-t border-white/10 bg-navy-900"
      aria-label="Primary"
    >
      <ul class="container-page flex flex-col py-3">
        {#each site.nav as item (item.href)}
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
            href={contact.booking.href}
            class="btn btn-primary w-full"
            onclick={close}
          >
            {contact.booking.label}
          </a>
        </li>
      </ul>
    </nav>
  {/if}
</header>
