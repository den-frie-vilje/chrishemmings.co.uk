/**
 * Sitewide podcast player state. A single shared store so the bottom player
 * bar (rendered once in the site layout) keeps playing as you navigate, and
 * any episode list can drive it. `playKey` bumps on each selection so the
 * bar knows to (re)start playback.
 */
import type { Episode } from '$lib/podcast';

export const player = $state<{ current: Episode | null; playKey: number; expanded: boolean }>({
  current: null,
  playKey: 0,
  expanded: false
});

export function playEpisode(ep: Episode): void {
  player.current = ep;
  player.playKey += 1;
  player.expanded = false;
}
