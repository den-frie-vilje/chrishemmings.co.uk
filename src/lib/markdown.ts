/**
 * Markdown → HTML for first-party, CMS-authored prose.
 *
 * Trust boundary: every string passed here originates in the repo's own
 * content JSON (edited via the GitHub-backed Sveltia admin) and is baked
 * into the static build at prerender time. `{@html}` of this output
 * carries the same trust as the rest of the source. NO runtime
 * user-generated markdown flows through here. (The podcast feed — which
 * IS third-party — is sanitised separately with DOMPurify at its own
 * boundary, never through these helpers.)
 */
import { marked } from 'marked';

marked.use({
  gfm: true,
  // Clamp every heading into the [h2, h3] band so a body can never emit
  // a second page-level <h1> (the page title owns the only <h1>).
  walkTokens(token) {
    if (token.type === 'heading') {
      token.depth = token.depth <= 2 ? 2 : 3;
    }
  },
  renderer: {
    // Absolute (off-site) links open in a new tab with safe rel; in-page
    // and relative links keep default behaviour.
    link(token) {
      const text = this.parser.parseInline(token.tokens);
      const title = token.title ? ` title="${token.title}"` : '';
      const external = /^https?:\/\//i.test(token.href);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${token.href}"${title}${attrs}>${text}</a>`;
    }
  }
});

/** Render a block-level markdown string to an HTML fragment (headings,
 *  paragraphs, lists, blockquotes, links, emphasis). */
export function renderMarkdown(md: string): string {
  return marked.parse((md ?? '').trim(), { async: false });
}
