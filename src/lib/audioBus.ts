/**
 * Single-play coordinator for the podcast players. When one player
 * starts, the previously-playing one is paused — only one episode plays
 * at a time across the page.
 */
let active: HTMLAudioElement | null = null;

/** Called when a player starts: pause whoever was playing. */
export function claim(audio: HTMLAudioElement): void {
  if (active && active !== audio) active.pause();
  active = audio;
}

/** Called when a player pauses/ends: clear it if it was the active one. */
export function release(audio: HTMLAudioElement): void {
  if (active === audio) active = null;
}
