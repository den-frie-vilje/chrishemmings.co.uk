/**
 * SEO + Schema.org structured data (single-locale, English).
 *
 * `buildPageSeo` assembles the typed `PageSeo` payload that `<SeoHead>`
 * renders. `buildSiteJsonLd` emits one `@graph` per page: the site-wide
 * entities (WebSite, the practice, Chris, his professional body and the
 * organisations he founded) plus that page's own WebPage node, all
 * cross-linked by `@id` so each crawlable URL carries the full entity.
 * Wikidata items and other identity links are CMS fields.
 */

import { PUBLIC_SITE_URL } from '$env/static/public';
import { site, contact, home, podcast, accolades } from '$lib/content';

/*
  `$env/static/public`, not dynamic. Static env is sourced from the
  committed `.env.[mode]` files at build time and hard-fails on a
  missing declaration, so a build can never silently fall back to
  the production default below. The dynamic variant resolves from
  the build process's environment instead of the mode files, which
  turned a mis-applied mode into silently-wrong baked output
  (until 2026-07-30 every staging image carried production
  canonicals + sitemap origin: the Dockerfile's `pnpm build --
  --mode` swallowed the mode flag, no `.env.staging` existed, and
  the dynamic fallback masked both).
*/
function normalizeSiteUrl(raw: string | undefined): string {
  const fallback = 'https://chrishemmings.co.uk';
  const value = (raw ?? '').trim() || fallback;
  return value.replace(/\/+$/, '');
}

export const SITE_URL = normalizeSiteUrl(PUBLIC_SITE_URL);

const THEME_COLOR = '#093449';

/** Absolute URL for a site-relative path. */
export function absUrl(path: string): string {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

function toE164(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/** Language of the site and the service (single-locale build; matches
 *  `<html lang>` in app.html). */
const LANGUAGE = 'en-GB';

const WEBSITE_ID = `${SITE_URL}/#website`;
const BUSINESS_ID = `${SITE_URL}/#practice`;
export const PERSON_ID = `${SITE_URL}/#chris`;
export const PODCAST_SERIES_ID = `${absUrl('/podcast')}#series`;

/** `@id` of a page's WebPage node. */
function webPageId(path: string): string {
  return `${absUrl(path)}#webpage`;
}

/** `@id` for a third-party organisation, keyed on its own domain so every
 *  mention of it in the graph resolves to one node. */
function orgId(url: string): string {
  return `${new URL(url).origin}/#organization`;
}

/** Drops blanks and duplicates (a trailing slash doesn't make a URL a
 *  different one); `undefined` when nothing is left, so the property is
 *  omitted from the JSON-LD instead of emitted empty. */
function compact(values: (string | undefined | null)[]): string[] | undefined {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const value = raw?.trim();
    if (!value) continue;
    const key = value.replace(/\/+$/, '').toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out.length ? out : undefined;
}

const schema = site.schema ?? {};

/** BACP membership number, single-sourced from the register URL. */
const bacpMembership = site.bacpRegisterUrl.split('/').filter(Boolean).pop() ?? '';

const professionalBody = schema.professionalBody?.url ? schema.professionalBody : undefined;
const professionalBodyRef = professionalBody ? { '@id': orgId(professionalBody.url) } : undefined;

/** Organisations Chris founded that link to a site of their own. */
const foundedOrgs = home.founder.orgs.filter(
  (o): o is typeof o & { href: string } => Boolean(o.href)
);

/** External profiles that disambiguate the entity (E-E-A-T): the Wikidata
 *  item and personal profiles from the CMS, then the BACP register, founded
 *  orgs, podcast platforms and social links from the rest of the content. */
const personSameAs = compact([
  schema.wikidata,
  ...(schema.profiles ?? []),
  site.bacpRegisterUrl,
  ...home.founder.orgs.map((o) => o.href),
  ...podcast.platforms.map((p) => p.href),
  ...(contact.social ?? []).map((s) => s.url)
]);

/**
 * Site-wide JSON-LD nodes, reinforced on every page so the entity is
 * consistent wherever a crawler lands: WebSite, the practice
 * (ProfessionalService), Chris (Person), his professional body and the
 * organisations he founded, all cross-linked by `@id`. Editorial text is
 * CMS-sourced (`site.schema`, contact details, accolades, founder
 * organisations); an optional value that is absent is left out of the markup.
 */
function siteGraph(): object[] {
  const website = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: site.name,
    description: site.description,
    inLanguage: LANGUAGE,
    publisher: { '@id': PERSON_ID }
  };

  // Modelled as an online ProfessionalService with NO postal address: a
  // Copenhagen / DK PostalAddress would geo-narrow the entity to Denmark and
  // work against the UK focus. `areaServed` (UK first), the .co.uk ccTLD and
  // `availableLanguage` carry the targeting instead.
  const practice = {
    '@type': 'ProfessionalService',
    '@id': BUSINESS_ID,
    name: site.name,
    url: `${SITE_URL}/`,
    image: absUrl(home.hero.portrait),
    telephone: toE164(contact.phone),
    email: contact.email,
    description: site.description,
    serviceType: schema.serviceType ?? 'Online psychotherapy and coaching for men',
    priceRange: schema.priceRange ?? '££',
    areaServed: schema.areaServed ?? ['United Kingdom', 'Worldwide (online)'],
    availableLanguage: 'English',
    founder: { '@id': PERSON_ID },
    provider: { '@id': PERSON_ID }
  };

  const registration = {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Professional registration',
    identifier: bacpMembership,
    url: site.bacpRegisterUrl,
    recognizedBy: professionalBodyRef
  };

  const qualifications = (schema.credentials ?? [])
    .filter((c) => c.name)
    .map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.name,
      credentialCategory: c.category,
      recognizedBy: c.institution
        ? { '@type': 'EducationalOrganization', name: c.institution, url: c.institutionUrl }
        : undefined
    }));

  const person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: site.name,
    url: `${SITE_URL}/`,
    image: absUrl(home.hero.portrait),
    jobTitle: schema.jobTitle ?? 'Psychotherapist & Coach for Men',
    description: schema.bio ?? site.description,
    mainEntityOfPage: { '@id': webPageId('/') },
    worksFor: { '@id': BUSINESS_ID },
    affiliation: foundedOrgs.length
      ? foundedOrgs.map((o) => ({ '@id': orgId(o.href) }))
      : undefined,
    memberOf: professionalBodyRef,
    knowsAbout: schema.knowsAbout ?? [],
    award: compact(accolades.map((a) => `${[a.title, a.year].filter(Boolean).join(' ')}, ${a.org}`)),
    hasCredential: [registration, ...qualifications],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: schema.contactType,
      email: contact.email,
      telephone: toE164(contact.phone),
      availableLanguage: 'English'
    },
    sameAs: personSameAs,
    knowsLanguage: ['en-GB', 'en']
  };

  const body = professionalBody
    ? [
        {
          '@type': 'Organization',
          '@id': orgId(professionalBody.url),
          name: professionalBody.name,
          alternateName: professionalBody.alternateName,
          url: professionalBody.url,
          sameAs: professionalBody.wikidata
        }
      ]
    : [];

  const founded = foundedOrgs.map((o) => ({
    '@type': 'Organization',
    '@id': orgId(o.href),
    name: o.name,
    url: o.href,
    sameAs: o.wikidata,
    founder: { '@id': PERSON_ID }
  }));

  return [website, practice, person, ...body, ...founded];
}

/**
 * `PodcastSeries` node for the podcast page. Chris and the co-hosts are the
 * creators; the publisher is the founder organisation named in the CMS
 * (referenced by `@id` so it resolves to the site-wide node).
 */
export function podcastSeriesNode(): object {
  const seo = podcast.seo;
  const publisher = foundedOrgs.find((o) => o.name === seo?.publisher);

  return {
    '@type': 'PodcastSeries',
    '@id': PODCAST_SERIES_ID,
    name: podcast.hero.title,
    url: absUrl('/podcast'),
    description: seo?.schemaDescription ?? seo?.description ?? site.description,
    image: absUrl(podcast.hero.cover),
    inLanguage: LANGUAGE,
    webFeed: podcast.feedUrl ?? absUrl(podcast.feedPath),
    sameAs: compact([
      seo?.wikidata,
      ...(seo?.profiles ?? []),
      ...podcast.platforms.map((p) => p.href)
    ]),
    creator: [
      { '@id': PERSON_ID },
      ...(seo?.coHosts ?? [])
        .filter((h) => h.name)
        .map((h) => ({
          '@type': 'Person',
          '@id': h.url ? `${new URL(h.url).origin}/#person` : undefined,
          name: h.name,
          url: h.url,
          sameAs: h.wikidata
        }))
    ],
    publisher: publisher
      ? { '@id': orgId(publisher.href) }
      : seo?.publisher
        ? { '@type': 'Organization', name: seo?.publisher }
        : undefined
  };
}

/** Site-wide JSON-LD graph, extended with page-specific nodes (the page's
 *  own `WebPage`, a `PodcastSeries` on the podcast page). */
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
  /** `@id` of the entity this page is primarily about (the WebPage's
   *  `mainEntity`). Without one the page is marked as `about` Chris. */
  mainEntity?: string;
}

/** Map a site-relative path to its OG slug (`/` → home). */
function ogSlug(path: string): string {
  if (path === '/') return 'home';
  return path.replace(/^\//, '').replace(/\/$/, '');
}

/** Serialise JSON-LD for an inline `<script>`: `<` is escaped so a
 *  content value can never close the element. */
function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Assemble the `PageSeo` for a page. */
export function buildPageSeo(input: BuildPageSeoInput): PageSeo {
  const canonical = absUrl(input.path);
  const ogTitle = input.ogTitle ?? input.title;
  const imageUrl = absUrl(input.image ?? `/img/og/${ogSlug(input.path)}.png`);
  const imageAlt = input.imageAlt ?? `${site.name} — ${site.tagline}`;

  const webPage = {
    '@type': 'WebPage',
    '@id': webPageId(input.path),
    url: canonical,
    name: input.title,
    description: input.description,
    inLanguage: LANGUAGE,
    isPartOf: { '@id': WEBSITE_ID },
    primaryImageOfPage: { '@type': 'ImageObject', url: imageUrl },
    ...(input.mainEntity
      ? { mainEntity: { '@id': input.mainEntity } }
      : { about: { '@id': PERSON_ID } })
  };

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
    jsonLd: serializeJsonLd(buildSiteJsonLd([webPage, ...(input.graph ?? [])]))
  };
}
