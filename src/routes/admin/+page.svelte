<!--
  Sveltia CMS admin host page. Renders as a plain host for the Sveltia
  bundle, which takes over <body> and mounts its own editor. Config is
  fetched from /admin/config.yml (static/admin/).

  The bundle is self-hosted at /admin/sveltia-cms.js — version-pinned via
  package.json's @sveltia/cms devDependency and copied into static/admin/
  by scripts/copy-sveltia.ts (the `prebuild` hook) before each build.

  In production the /admin directory is stripped from the image
  (STRIP_EDITOR=true in deploy-production.yml) — the editor lives on
  staging only, behind the GitHub OAuth proxy.
-->
<svelte:head>
  <title>Chris Hemmings — Admin</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta
    http-equiv="content-security-policy"
    content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://avatars.githubusercontent.com https://*.githubusercontent.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.github.com https://github.com https://avatars.githubusercontent.com https://*.githubusercontent.com; worker-src 'self' blob:; base-uri 'self';"
  />
  <!-- Classic (non-module) script — Sveltia ships a UMD bundle. -->
  <script src="/admin/sveltia-cms.js"></script>
</svelte:head>
