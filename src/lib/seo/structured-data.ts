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
import { site, contact } from '$lib/content';

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

/**
 * Site-wide JSON-LD graph: ProfessionalService + Person. Emitted on
 * every page so the entity is reinforced site-wide. `serviceType` and
 * the Person's `knowsAbout` advertise the men's-therapy specialism.
 */
export function buildSiteJsonLd(): object {
  const practice = {
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': BUSINESS_ID,
    name: site.name,
    url: `${SITE_URL}/`,
    telephone: toE164(contact.phone),
    email: contact.email,
    description: site.description,
    serviceType: 'Psychotherapy and coaching for men',
    areaServed: [
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Place', name: 'Europe (online)' }
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Copenhagen',
      addressCountry: 'DK'
    },
    founder: { '@id': PERSON_ID },
    provider: { '@id': PERSON_ID }
  };

  const person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: site.name,
    jobTitle: 'Psychotherapist & Coach',
    description:
      'Psychotherapist and coach specialising in working with men; founder of Men’s Therapy Hub and M-Path; former BBC journalist and author of ‘Be a Man’ (2017).',
    worksFor: { '@id': BUSINESS_ID },
    knowsAbout: [
      'Men’s mental health',
      'Masculinity',
      'Anxiety',
      'Depression',
      'Addiction',
      'Relationships',
      'Psychotherapy',
      'Coaching'
    ],
    memberOf: {
      '@type': 'Organization',
      name: 'British Association for Counselling and Psychotherapy (BACP)'
    },
    knowsLanguage: ['en']
  };

  return { '@context': 'https://schema.org', '@graph': [practice, person] };
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
}

/** Assemble the `PageSeo` for a page. */
export function buildPageSeo(input: BuildPageSeoInput): PageSeo {
  const canonical = absUrl(input.path);
  const ogTitle = input.ogTitle ?? input.title;
  const imageUrl = absUrl(input.image ?? '/img/og/home.jpg');

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
        alt: `${site.name} — ${site.tagline}`,
        width: 1200,
        height: 630,
        type: 'image/jpeg'
      }
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: input.description,
      image: imageUrl
    },
    jsonLd: JSON.stringify(buildSiteJsonLd())
  };
}
