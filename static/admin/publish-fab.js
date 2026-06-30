/**
 * Floating "Publish" button on /admin.
 *
 * Adds an orange pill labelled "Publish" to Sveltia's top toolbar that
 * takes the editor to /publish (which merges staging→main and triggers a
 * production deploy).
 *
 * Why JS-injected from a separate file rather than a static <a> baked into
 * the prerendered admin page:
 *   1. Sveltia mounts its app-shell in <body> at runtime and SvelteKit's
 *      preload-data runtime clears the root div's children, so any static
 *      element in the page template gets removed before Sveltia mounts.
 *   2. The link must be auth-aware — visible only after sign-in.
 *   3. Its position must track Sveltia's toolbar (which shifts when the
 *      announcement banner toggles).
 *
 * Approach: inject a <style> into <head> once; poll every second; when
 * authed, ensure the anchor is in <body> and ride its `top` along
 * Sveltia's primary `[role="toolbar"]`. Auth = presence of a token at
 * localStorage["sveltia-cms.user"].token (the same key /publish reads).
 */

(function () {
  'use strict';

  const FAB_CLASS = 'chrishemmings-publish-fab';
  const STYLE_ID = 'chrishemmings-fab-style';
  const STORAGE_KEY = 'sveltia-cms.user';
  const PUBLISH_URL = '/publish';
  const SYNC_INTERVAL_MS = 1000;

  function isAuthed() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!(parsed && parsed.token);
    } catch (e) {
      return false;
    }
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '.' +
      FAB_CLASS +
      ' {' +
      'position: fixed;' +
      'right: 120px;' +
      'top: 14px;' +
      'z-index: 99999;' +
      'background: #ff9902;' +
      'color: #06283a;' +
      'padding: 8px 16px;' +
      'border-radius: 9999px;' +
      'text-decoration: none;' +
      'font: 700 14px/1.2 system-ui, -apple-system, sans-serif;' +
      'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);' +
      'letter-spacing: 0.01em;' +
      'white-space: nowrap;' +
      'transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;' +
      '}' +
      '.' +
      FAB_CLASS +
      ':hover {' +
      'transform: translateY(-1px);' +
      'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);' +
      'background: #e8780a;' +
      'color: #fff;' +
      '}';
    document.head.appendChild(style);
  }

  function makeFab() {
    const a = document.createElement('a');
    a.className = FAB_CLASS;
    a.href = PUBLISH_URL;
    a.title = 'Publish changes to production';
    a.textContent = 'Publish';
    return a;
  }

  function findVisibleToolbar() {
    const toolbars = document.querySelectorAll('[role="toolbar"]');
    for (const tb of toolbars) {
      const r = tb.getBoundingClientRect();
      if (r.height > 0 && r.width > 0) return tb;
    }
    return null;
  }

  function sync() {
    let fab = document.querySelector('.' + FAB_CLASS);
    if (isAuthed()) {
      const anchor = findVisibleToolbar();
      const top = anchor ? anchor.getBoundingClientRect().top + 12 : 12;
      if (!fab) {
        fab = makeFab();
        document.body.appendChild(fab);
      }
      fab.style.top = top + 'px';
    } else if (fab) {
      fab.remove();
    }
  }

  function start() {
    injectStyles();
    sync();
    window.addEventListener('storage', sync);
    setInterval(sync, SYNC_INTERVAL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
