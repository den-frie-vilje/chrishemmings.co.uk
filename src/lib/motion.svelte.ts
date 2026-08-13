/**
 * Sitewide motion preferences. One shared reactive read of
 * `prefers-reduced-motion` plus the house slide-transition options, so every
 * animated disclosure (bottom player, season accordions, burger menu) moves
 * identically — and all of them collapse to instant under reduced motion.
 * Mirrors the store pattern of `player.svelte.ts`.
 */
import { cubicOut } from 'svelte/easing';

const pref = $state({ reduce: false });

// Module code runs during prerender too — only touch matchMedia in the browser.
if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  pref.reduce = mq.matches;
  mq.addEventListener('change', () => (pref.reduce = mq.matches));
}

export const motion = {
  get reduce(): boolean {
    return pref.reduce;
  },
  /** House options for `transition:slide` — 280ms cubicOut, 0 under reduced motion. */
  get slideOpts(): { duration: number; easing: typeof cubicOut } {
    return { duration: pref.reduce ? 0 : 280, easing: cubicOut };
  }
};
