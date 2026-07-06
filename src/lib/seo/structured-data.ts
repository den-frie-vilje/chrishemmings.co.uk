/**
 * SEO + Schema.org structured data (single-locale, English).
 *
 * `buildPageSeo` assembles the typed `PageSeo` payload that `<SeoHead>`
 * renders. `buildSiteJsonLd` emits a `@graph` with the practice
 * (ProfessionalService) and Chris (Person), cross-linked by `@id` and
 * reinforced on every page so each crawlable URL carries the full
 * entity. The therapist's credentials surface via the Person node.
 */

import { env } from '$env/dynamic/public';
import { site, contact, home, podcast } from '$lib/content';

function normalizeSiteUrl(raw: string | undefined): string {
  const fallback = 'https://chrishemmings.co.uk';
  const value = (raw ?? '').trim() || fallback;
  return value.replace(/\/+$/, '');
}

export const SITE_URL = normalizeSiteUrl(env.PUBLIC_SITE_URL);

const THEME_COLOR = '#093449';

/** Absolute URL for a site-relative path. */
export function absUrl(path: string): string {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

function toE164(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

const BUSINESS_ID = `${SITE_URL}/#practice`;
const PERSON_ID = `${SITE_URL}/#chris`;

/** BACP membership number, single-sourced from the register URL. */
const bacpMembership = site.bacpRegisterUrl.split('/').filter(Boolean).pop() ?? '';

/** External profiles that disambiguate the entity (E-E-A-T). Single-sourced
 *  from content: BACP register + founded orgs + podcast platforms. */
const personSameAs = [
  site.bacpRegisterUrl,
  ...home.founder.orgs.map((o) => o.href).filter((h): h is string => Boolean(h)),
  ...podcast.platforms.map((p) => p.href),
  ...contact.social.map((s) => s.url)
];

/**
 * Site-wide JSON-LD nodes: ProfessionalService + Person. Reinforced on
 * every page so the entity is consistent site-wide. `serviceType` and the
 * Person's `knowsAbout` advertise the men's-therapy specialism; `sameAs`
 * and `hasCredential` strengthen entity disambiguation and E-E-A-T.
 */
function siteGraph(): object[] {
  // Modelled as an online ProfessionalService with NO postal address: a
  // Copenhagen / DK PostalAddress would geo-narrow the entity to Denmark and
  // work against the UK focus. `areaServed` (UK first), the .co.uk ccTLD and
  // `availableLanguage` carry the targeting instead. All editorial text is
  // CMS-sourced from `site.schema` — nothing baked into the build.
  const practice = {
    '@type': 'ProfessionalService',
    '@id': BUSINESS_ID,
    name: site.name,
    url: `${SITE_URL}/`,
    image: absUrl(home.hero.portrait),
    telephone: toE164(contact.phone),
    email: contact.email,
    description: site.description,
    serviceType: site.schema.serviceType,
    priceRange: '££',
    areaServed: site.schema.areaServed,
    availableLanguage: 'English',
    founder: { '@id': PERSON_ID },
    provider: { '@id': PERSON_ID }
  };

  const person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: site.name,
    url: `${SITE_URL}/`,
    image: absUrl(home.hero.portrait),
    jobTitle: site.schema.jobTitle,
    description: site.schema.bio,
    worksFor: { '@id': BUSINESS_ID },
    knowsAbout: site.schema.knowsAbout,
    memberOf: {
      '@type': 'Organization',
      name: 'British Association for Counselling and Psychotherapy (BACP)',
      url: 'https://www.bacp.co.uk'
    },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Professional registration',
      identifier: bacpMembership,
      recognizedBy: {
        '@type': 'Organization',
        name: 'British Association for Counselling and Psychotherapy (BACP)',
        url: 'https://www.bacp.co.uk'
      }
    },
    sameAs: personSameAs,
    knowsLanguage: ['en-GB', 'en']
  };

  return [practice, person];
}

/** Site-wide JSON-LD graph, optionally extended with page-specific nodes
 *  (e.g. a `PodcastSeries` on the podcast page). */
export function buildSiteJsonLd(extra: object[] = []): object {
  return { '@context': 'https://schema.org', '@graph': [...siteGraph(), ...extra] };
}

export interface PageSeoImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  type: string;
}

export interface PageSeo {
  title: string;
  description: string;
  author: string;
  themeColor: string;
  canonical: string;
  og: {
    type: 'website';
    siteName: string;
    title: string;
    description: string;
    url: string;
    image: PageSeoImage;
  };
  twitter: {
    card: 'summary_large_image';
    title: string;
    description: string;
    image: string;
  };
  jsonLd: string;
}

interface BuildPageSeoInput {
  /** Site-relative path, e.g. `/working-together`. */
  path: string;
  /** `<title>` text (page-specific; brand appended by caller if wanted). */
  title: string;
  description: string;
  /** OG title override (defaults to `title`). */
  ogTitle?: string;
  /** Site-relative OG image path; defaults to the shared home OG. */
  image?: string;
  /** Alt text for the OG image (defaults to the name + tagline lockup). */
  imageAlt?: string;
  /** Extra JSON-LD `@graph` nodes for this page (e.g. `PodcastSeries`). */
  graph?: object[];
}

/** Map a site-relative path to its OG slug (`/` → home). */
function ogSlug(path: string): string {
  if (path === '/') return 'home';
  return path.replace(/^\//, '').replace(/\/$/, '');
}

/** Assemble the `PageSeo` for a page. */
export function buildPageSeo(input: BuildPageSeoInput): PageSeo {
  const canonical = absUrl(input.path);
  const ogTitle = input.ogTitle ?? input.title;
  const imageUrl = absUrl(input.image ?? `/img/og/${ogSlug(input.path)}.png`);
  const imageAlt = input.imageAlt ?? `${site.name} — ${site.tagline}`;

  return {
    title: input.title,
    description: input.description,
    author: site.name,
    themeColor: THEME_COLOR,
    canonical,
    og: {
      type: 'website',
      siteName: site.name,
      title: ogTitle,
      description: input.description,
      url: canonical,
      image: {
        url: imageUrl,
        alt: imageAlt,
        width: 1200,
        height: 630,
        type: 'image/png'
      }
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: input.description,
      image: imageUrl
    },
    jsonLd: JSON.stringify(buildSiteJsonLd(input.graph))
  };
}
