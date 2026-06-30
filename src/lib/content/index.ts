/**
 * Content access layer.
 *
 * All site copy lives in `src/content/*.json` and is imported here at
 * build time (single-locale, English). Prose fields are **markdown
 * strings** (rendered via `$lib/markdown`), not arrays of bullets —
 * structured arrays are reserved for genuine lists (nav, interests,
 * qualifications, talks). Components never import the JSON directly;
 * they go through the typed accessors below.
 */

import siteData from '../../content/site.json';
import contactData from '../../content/contact.json';
import homeData from '../../content/home.json';
import workingTogetherData from '../../content/working-together.json';
import publicSpeakingData from '../../content/public-speaking.json';
import podcastData from '../../content/podcast.json';

export interface NavItem {
  label: string;
  href: string;
}

export interface Site {
  name: string;
  tagline: string;
  description: string;
  themeColor: string;
  nav: NavItem[];
  footerNote: string;
}

export interface Booking {
  label: string;
  sub: string;
  href: string;
}

export interface Contact {
  heading: string;
  intro: string;
  email: string;
  emailHref: string;
  phone: string;
  phoneHref: string;
  location: string;
  booking: Booking;
}

export interface Org {
  name: string;
  href?: string;
  logo: string;
}

export interface Interest {
  title: string;
  /** Single-line prose. */
  body: string;
}

export interface Home {
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    portrait: string;
    portraitAlt: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  testimonial: { lead: string; quote: string; attribution: string };
  about: { title: string; body: string };
  founder: { intro: string; orgs: Org[] };
  interests: { title: string; intro: string; items: Interest[] };
}

export interface WorkingTogether {
  hero: { eyebrow: string; title: string; subtitle: string; portrait: string; portraitAlt: string };
  /** Markdown. */
  intro: string;
  qualifications: { title: string; items: string[]; regulatorNote: string };
  fees: {
    eyebrow: string;
    range: string;
    unit: string;
    headline: string;
    /** Markdown. */
    body: string;
  };
  furtherInfo: { title: string; body: string };
}

export interface Talk {
  title: string;
  /** Markdown. */
  body: string;
  popularWith: string;
}

export interface PublicSpeaking {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    intro: string;
    portrait: string;
    portraitAlt: string;
    cta: string;
  };
  orgsWorkedWith: { title: string; logoStrip: string; logoStripAlt: string };
  experienced: { title: string; body: string };
  story: { title: string; body: string };
  talks: { title: string; items: Talk[] };
}

export interface PodcastPlatform {
  name: string;
  href: string;
}

export interface Podcast {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    intro: string;
    cover: string;
    coverAlt: string;
  };
  /** Markdown. */
  about: string;
  feedPath: string;
  platforms: PodcastPlatform[];
}

export const site: Site = siteData;
export const contact: Contact = contactData;
export const home: Home = homeData;
export const workingTogether: WorkingTogether = workingTogetherData;
export const publicSpeaking: PublicSpeaking = publicSpeakingData;
export const podcast: Podcast = podcastData;

/** Footer note with the `{year}` placeholder resolved. */
export function footerNote(year: number): string {
  return site.footerNote.replace('{year}', String(year));
}
