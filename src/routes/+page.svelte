<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { i18n } from '$lib/i18n';
  import BgCarousel from '$lib/components/BgCarousel.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import OffersGrid from '$lib/components/OffersGrid.svelte';
  import ResultsList from '$lib/components/ResultsList.svelte';

  // Traductor simple dependiente de $i18n
  $: t = (k: string, fallback?: string) => {
    const v = $i18n[k];
    return v === k ? (fallback ?? k) : v;
  };

  // Estado controlado por SearchBar (bind)
  let trip: 'oneway' | 'round' = 'round';
  let origin = 'BCN';
  let destination = 'EVN';
  let depart = '';
  let ret = '';
  let adults: number = 1;
  let bags: number = 0;

  // Estado de resultados (solo visualización aquí)
  let loading = false;
  let error = '';

  type SearchResult = {
    results?: any[];
    [key: string]: any;
  } | null;

  let data: SearchResult = null;

  // Imágenes del hero
  const HERO_IMAGES = Array.from({ length: 12 }, (_, i) => `/barcelona${i + 1}.jpg`);
</script>

<BgCarousel images={HERO_IMAGES} intervalMs={5000}>
  <div class="hero-wrap">
    <h1 class="hero-title">{t('hero.title', 'Find the best flights')}</h1>

    <!-- SearchBar busca y emite eventos -->
    <SearchBar
      bind:trip={trip}
      bind:origin={origin}
      bind:destination={destination}
      bind:depart={depart}
      bind:ret={ret}
      bind:adults={adults}
      bind:bags={bags}
      endpoint="/api/search"
      debug={true}
      updateUrl={true}
      on:searchstart={() => { loading = true; error = ''; data = null; }}
      on:results={(e) => { data = e.detail; loading = false; }}
      on:error={(e) => { error = e.detail ?? 'Error en la búsqueda'; loading = false; }}
    />

    <!-- Estado accesible para lectores de pantalla -->
    <p class="sr-only" aria-live="polite" role="status">
      {#if loading}{t('status.searching','Searching…')}
      {:else if error}{error}
      {:else if data && (data.results?.length ?? 0) > 0}{t('status.results','Results loaded')}
      {:else if data}{t('status.no_results','No results')}
      {/if}
    </p>

    <!-- Resultados inline -->
    <div class="results-wrap">
      {#if loading}
        <p class="status loading">{t('status.searching','Searching…')}</p>
      {:else if error}
        <p class="status error">⚠️ {error}</p>
      {:else if data && (data.results?.length ?? 0) > 0}
        <ResultsList {data} />
      {:else if data}
        <p class="status empty">{t('status.no_results','No results')}</p>
      {/if}
    </div>
  </div>
</BgCarousel>

<!-- Ofertas destacadas -->
<OffersGrid />

<style>
  /* Contenedor del hero para espaciar título, buscador y resultados */
  .hero-wrap {
    width: min(1100px, 100% - 32px);
    margin-inline: auto;
    display: grid;
    gap: 20px;
    padding-top: 8vh;            /* despega del borde superior en pantallas altas */
  }

  /* Título del hero: más flexible y legible */
  .hero-title {
    font-weight: 500;
    font-size: clamp(22px, 3.2vw + 10px, 36px);
    line-height: 1.15;
    margin: 0 0 16px;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.25);
    letter-spacing: .2px;
  }

  /* En móviles pequeños, reducimos más los márgenes */
  @media (max-width: 640px) {
    .hero-wrap { gap: 16px; padding-top: 6vh; }
    .hero-title { margin-bottom: 10px; }
  }
  @media (max-width: 420px) {
    .hero-wrap { width: min(100%, 100% - 24px); }
  }

  /* Resultados: que no peguen contra el buscador */
  .results-wrap {
    margin-top: 8px;
  }

  /* Estados de texto */
  .status {
    margin-top: 10px;
    font-size: 0.95rem;
  }
  .status.loading { color: #e6f0ff; opacity: .95; }
  .status.error { color: #ffdee0; text-shadow: 0 1px 0 rgba(0,0,0,.15); }
  .status.empty { color: #eef2ff; opacity: .95; }

  /* Solo-lectura para accesibilidad */
  .sr-only {
    position: absolute;
    left: -9999px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
</style>
