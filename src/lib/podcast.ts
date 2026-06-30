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
  /** Sanitised HTML description. */
  descriptionHtml: string;
  /** Canonical episode page on Acast. */
  link: string;
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
    const rawDesc = text(item, 'description');

    return {
      guid: text(item, 'guid') || text(item, 'link'),
      title: text(item, 'title'),
      dateLabel: label,
      isoDate: iso,
      durationLabel: formatDuration(text(item, 'itunes:duration')),
      audioUrl: enclosure?.getAttribute('url') ?? '',
      image: epImage,
      descriptionHtml: DOMPurify.sanitize(rawDesc, SANITIZE_OPTS),
      link: text(item, 'link')
    };
  });
}
