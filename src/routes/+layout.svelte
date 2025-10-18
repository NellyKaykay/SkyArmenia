<script lang="ts">
  import { page } from '$app/stores';
  import { i18n, lang, type Lang } from '$lib/i18n';
  import { PUBLIC_SITE_URL } from '$env/static/public';

  let current: Lang = 'es';
  $: current = $lang;
  $: pathname = $page?.url?.pathname || '';
  $: isAuth = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // Normaliza base (sin barra final)
  $: site = (PUBLIC_SITE_URL || 'https://skyarmenia.com').replace(/\/+$/, '');
  // URL completa de la página actual
  $: fullUrl = site + $page.url.pathname + ($page.url.search || '');

  // Helper de traducción
  $: t = (k: string, fallback?: string) => {
    const v = ($i18n as any)?.[k];
    return typeof v === 'string' ? v : (fallback ?? k);
  };

  function href(path: string, params: Record<string, string> = {}) {
    const sp = new URLSearchParams(params);
    sp.set('lang', current);
    const qs = sp.toString();
    return qs ? `${path}?${qs}` : path;
  }
</script>

<svelte:head>
  <!-- Canonical -->
  <link rel="canonical" href={fullUrl} />

  <!-- OpenGraph -->
  <meta property="og:url" content={fullUrl} />
  <meta property="og:site_name" content="SkyArmenia" />
  <meta property="og:title" content="SkyArmenia" />
  <meta property="og:description" content="Vuelos Barcelona ↔︎ Ereván con buscador rápido y claro." />
  <meta property="og:type" content="website" />
  <meta property="og:image" content={site + '/og.jpg'} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={fullUrl} />
  <meta name="twitter:title" content="SkyArmenia" />
  <meta name="twitter:description" content="Vuelos Barcelona ↔︎ Ereván con buscador rápido y claro." />
  <meta name="twitter:image" content={site + '/og.jpg'} />
</svelte:head>

<slot />

<style>
  :global(:root) {
    --text: #0c0c0d;
    --muted: #6b7280;
    --bg: #fff;
    --hover: #f6f7f8;
    --shadow: 0 1px 6px rgba(0, 0, 0, 0.035);
    --radius: 999px;
  }

  :global(body) {
    margin: 0;
    color: var(--text);
    background: var(--bg);
    font-family: system-ui, sans-serif;
  }
</style>
