/**
 * Client-side Acast feed parsing + sanitisation.
 *
 * Runs in the BROWSER only (uses `DOMParser` + `DOMPurify`). The feed is
 * THIRD-PARTY content, so episode descriptions are sanitised before they
 * ever reach `{@html}` — this is the trust boundary the first-party
 * `$lib/markdown` helpers deliberately do not cross.
 */
import DOMPurify from 'dompurify';

export interface Episode {
  guid: string;
  title: string;
  /** Localised date label, e.g. "16 Jun 2026". */
  dateLabel: string;
  /** ISO date for <time datetime>. */
  isoDate: string;
  /** Human duration, e.g. "44 min". */
  durationLabel: string;
  /** Direct MP3 enclosure URL. */
  audioUrl: string;
  /** Episode artwork URL (may be the show artwork as a fallback). */
  image: string;
  /** Sanitised HTML description (Acast hosting footer stripped). */
  descriptionHtml: string;
  /** Plain-text one-paragraph excerpt for compact cards. */
  excerpt: string;
  /** Canonical episode page on Acast. */
  link: string;
  /** itunes:season number (empty string if the feed has none). */
  season: string;
}

export interface Season {
  /** Season number as a string (feed order). */
  number: string;
  episodes: Episode[];
}

/** Split a title at its first dash so the lead can be set bold and the
 *  (often long) descriptive tail set lighter. Handles -, – and —. */
export function splitTitle(title: string): { head: string; tail: string } {
  const m = title.match(/^(.*?)(\s+[-–—]\s+.*)$/);
  return m ? { head: m[1], tail: m[2] } : { head: title, tail: '' };
}

function text(item: Element, tag: string): string {
  const el = item.getElementsByTagName(tag)[0];
  return el?.textContent?.trim() ?? '';
}

function formatDate(pubDate: string): { label: string; iso: string } {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return { label: '', iso: '' };
  const label = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  return { label, iso: d.toISOString().slice(0, 10) };
}

/** Acast durations come as `HH:MM:SS`, `MM:SS`, or a raw seconds count. */
function formatDuration(raw: string): string {
  if (!raw) return '';
  let seconds: number;
  if (raw.includes(':')) {
    const parts = raw.split(':').map((p) => parseInt(p, 10));
    seconds = parts.reduce((acc, n) => acc * 60 + (Number.isNaN(n) ? 0 : n), 0);
  } else {
    seconds = parseInt(raw, 10);
  }
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

const SANITIZE_OPTS = {
  ALLOWED_TAGS: ['p', 'br', 'a', 'em', 'strong', 'b', 'i', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel']
};

/** Strip the boilerplate Acast hosting footer + collapse whitespace. */
function cleanDescription(raw: string): string {
  // Acast appends `<hr><p>Hosted on Acast. See acast.com/privacy …</p>` —
  // everything from the rule onward is boilerplate.
  return raw.split(/<hr\b/i)[0];
}

/** Plain-text, single-paragraph excerpt for compact cards. */
function excerptFrom(html: string, max = 200): string {
  const text = html
    .replace(/<\/(p|div|li)>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/Hosted on Acast.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

/** Parse an Acast RSS feed XML string into episodes (newest first). */
export function parseFeed(xml: string): Episode[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Failed to parse podcast feed XML');
  }

  const showImage = doc.querySelector('channel > image > url')?.textContent?.trim() ?? '';
  const items = Array.from(doc.getElementsByTagName('item'));

  return items.map((item) => {
    const { label, iso } = formatDate(text(item, 'pubDate'));
    const enclosure = item.getElementsByTagName('enclosure')[0];
    const epImage =
      item.getElementsByTagName('itunes:image')[0]?.getAttribute('href') ?? showImage;
    const descriptionHtml = DOMPurify.sanitize(
      cleanDescription(text(item, 'description')),
      SANITIZE_OPTS
    );

    return {
      guid: text(item, 'guid') || text(item, 'link'),
      title: text(item, 'title'),
      dateLabel: label,
      isoDate: iso,
      durationLabel: formatDuration(text(item, 'itunes:duration')),
      audioUrl: enclosure?.getAttribute('url') ?? '',
      image: epImage,
      descriptionHtml,
      excerpt: excerptFrom(descriptionHtml),
      link: text(item, 'link'),
      season: text(item, 'itunes:season')
    };
  });
}

/**
 * Group episodes by season, newest season first, preserving feed order
 * within each season. Returns an empty array when the feed carries no
 * usable season tags — callers fall back to a flat list in that case.
 */
export function groupBySeason(episodes: Episode[]): Season[] {
  const byNumber = new Map<string, Episode[]>();
  for (const ep of episodes) {
    if (!ep.season) return []; // any episode missing a season → treat as unseasoned
    if (!byNumber.has(ep.season)) byNumber.set(ep.season, []);
    byNumber.get(ep.season)!.push(ep);
  }
  return [...byNumber.entries()]
    .map(([number, eps]) => ({ number, episodes: eps }))
    .sort((a, b) => Number(b.number) - Number(a.number));
}
