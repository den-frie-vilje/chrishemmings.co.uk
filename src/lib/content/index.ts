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
import bookingData from '../../content/booking.json';
import getInTouchData from '../../content/get-in-touch.json';
import homeData from '../../content/home.json';
import workingTogetherData from '../../content/working-together.json';
import publicSpeakingData from '../../content/public-speaking.json';
import podcastData from '../../content/podcast.json';
import testimonialsData from '../../content/testimonials.json';
import accoladesData from '../../content/accolades.json';

export interface NavItem {
  label: string;
  href: string;
  /**
   * Responsive collapse priority — which breakpoint this link stays inline
   * to before dropping into the burger. Travels WITH the item (not keyed to
   * the slug), so renaming a route can't silently change the header layout;
   * a new route must make an explicit choice. `'always'` = inline whenever
   * the desktop nav shows; `'navmini'` = from the navmini breakpoint up;
   * `'md'` (default) = only md+ (lives in the burger below that).
   */
  collapse?: 'always' | 'navmini' | 'md';
}

/** Per-page social-share (OG) card copy. Name + tagline lockup and the
 *  portrait come from elsewhere; these are the page-specific lines. */
export interface Og {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
}

export interface Site {
  name: string;
  tagline: string;
  description: string;
  themeColor: string;
  footerNote: string;
  /** Official BACP register profile link — the single source of truth. */
  bacpRegisterUrl: string;
}

/** A third-party accolade / named-list recognition. Sitewide list (sister
 *  to testimonials): shown under the home founder block and on the speaking
 *  page. */
export interface Accolade {
  /** The accolade name, e.g. "Men & Boys Champion". */
  title: string;
  /** Year awarded (optional), e.g. "2026". */
  year?: string;
  /** Awarding body. */
  org: string;
  /** Public page or PDF that names it (optional; opens in a new tab). */
  href?: string;
}

export interface Booking {
  label: string;
  sub: string;
  href: string;
}

/** Overarching contact details (general collection) — reused site-wide by
 *  the contact section, footer and SEO. NOT the Get-in-touch page copy. */
export interface Contact {
  /** Eyebrow shown above the contact CTA block. */
  heading: string;
  email: string;
  emailHref: string;
  phone: string;
  phoneHref: string;
  location: string;
}

/** Get-in-touch PAGE copy (pages collection): editorial only — the
 *  contact details + booking CTA are pulled from the general collection. */
/** One of the two enquiry paths (individuals → therapy; organisations →
 *  speaking) shown on the Get-in-touch page. */
export interface GetInTouchPath {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  linkLabel: string;
  linkHref: string;
}

export interface GetInTouch {
  navLabel: string;
  heading: string;
  intro: string;
  paths: GetInTouchPath[];
  whatToExpect: { eyebrow: string; title: string; steps: { title: string; body: string }[] };
  reassurances: string[];
  og: Og;
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
  navLabel: string;
  hero: {
    eyebrow: string;
    title: string;
    /** Lighter-weight descriptor shown under the name in the hero H1. */
    titleAccent: string;
    lead: string;
    /** Framed JPG — used for the OG/social card and JSON-LD imagery. */
    portrait: string;
    /** Background-removed cutout shown in the hero itself. */
    cutout: string;
    portraitAlt: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  about: { title: string; body: string };
  founder: { intro: string; orgs: Org[] };
  /** Press / media outlets that have featured Chris's work — shown as a
   *  scrolling logo marquee on the home page. */
  featuredIn: { title: string; logos: OrgLogo[] };
  interests: { title: string; intro: string; items: Interest[] };
  speakingPromo: { eyebrow: string; title: string; body: string; cta: string };
  og: Og;
}

export interface WorkingTogether {
  navLabel: string;
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
  og: Og;
}

export interface Talk {
  title: string;
  /** Markdown. */
  body: string;
  popularWith: string;
}

export interface PublicSpeaking {
  navLabel: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    intro: string;
    portrait: string;
    portraitAlt: string;
    cta: string;
  };
  orgsWorkedWith: { title: string; logos: OrgLogo[] };
  experienced: { title: string; body: string };
  story: { title: string; body: string };
  talks: { title: string; groups: { name: string; items: Talk[] }[] };
  og: Og;
}

export interface PodcastPlatform {
  name: string;
  href: string;
}

export interface Podcast {
  navLabel: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    intro: string;
    cover: string;
    coverAlt: string;
  };
  /** Copy for the podcast section on the home page (above the latest episodes). */
  homeTeaser: {
    title: string;
    blurb: string;
  };
  /** Markdown. */
  about: string;
  feedPath: string;
  platforms: PodcastPlatform[];
  og: Og;
}

export interface Testimonial {
  quote: string;
  /** Attribution name — anonymised for therapy ("Client, M, 28"),
   *  real name for commercial/speaking clients. */
  name: string;
  /** Optional role / context (e.g. "Head of Wellbeing"). */
  detail?: string;
  /** Optional organisation (commercial testimonials). */
  org?: string;
  /** Optional logo (commercial testimonials show the client logo). */
  logo?: string;
}

export interface OrgLogo {
  name: string;
  logo: string;
}

export interface Testimonials {
  /** Anonymised therapy-client testimonials. */
  therapy: Testimonial[];
  /** Commercial / public-speaking client testimonials. */
  speaking: Testimonial[];
}

interface AccoladesFile {
  items: Accolade[];
}

export const site: Site = siteData;
export const contact: Contact = contactData;
export const booking: Booking = bookingData;
export const getInTouch: GetInTouch = getInTouchData;
export const home: Home = homeData;
export const workingTogether: WorkingTogether = workingTogetherData;
export const publicSpeaking: PublicSpeaking = publicSpeakingData;
export const podcast: Podcast = podcastData;
export const testimonials: Testimonials = testimonialsData;
export const accolades: Accolade[] = (accoladesData as AccoladesFile).items;

/**
 * Primary navigation — GENERATED, not hand-entered. Each item pairs a
 * page's fixed route (the slug, owned by the route tree) with that page's
 * own `navLabel`, so there's no separate nav list to keep in sync and no
 * URLs to type in the CMS. Order is the only nav-specific decision here.
 */
export const nav: NavItem[] = [
  { href: '/', label: home.navLabel, collapse: 'md' },
  { href: '/working-together', label: workingTogether.navLabel, collapse: 'always' },
  { href: '/public-speaking', label: publicSpeaking.navLabel, collapse: 'always' },
  { href: '/podcast', label: podcast.navLabel, collapse: 'md' },
  { href: '/get-in-touch', label: getInTouch.navLabel, collapse: 'navmini' }
];

/** Footer note with the `{year}` placeholder resolved. */
export function footerNote(year: number): string {
  return site.footerNote.replace('{year}', String(year));
}
