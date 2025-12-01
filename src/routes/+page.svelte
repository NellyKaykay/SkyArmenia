<!-- Página principal - SkyArmenia -->
<script lang="ts">
  import { dev } from '$app/environment';
  import { i18n } from '$lib/i18n';
  import BgCarousel from '$lib/components/BgCarousel.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import OffersGrid from '$lib/components/OffersGrid.svelte';
  import ResultsList from '$lib/components/ResultsList.svelte';

  // Helper de traducción con fallback
  $: t = (key: string, fallback?: string): string => {
    const value = $i18n[key];
    return value === key ? (fallback ?? key) : value;
  };

  // Tipos de datos
  interface SearchResult {
    results?: Array<{
      id?: string;
      price?: number;
      airline?: string;
      departure?: string;
      arrival?: string;
      [key: string]: any;
    }>;
    error?: string;
    [key: string]: any;
  }

  // Estado del formulario de búsqueda
  function getDefaultSearchParams() {
    return {
      trip: 'round' as 'oneway' | 'round',
      origin: 'BCN',
      destination: 'EVN',
      depart: '',
      ret: '',
      adults: 1,
      bags: 0
    };
  }
  let searchParams = getDefaultSearchParams();

  // Resetear el searchbar si se hace click en el logo
  if (typeof window !== 'undefined') {
    window.addEventListener('reset-searchbar', () => {
      searchParams = getDefaultSearchParams();
    });
  }

  // Estado de la aplicación
  let appState = {
    loading: false,
    error: '',
    data: null as SearchResult | null
  };

  // Configuración
  const CONFIG = {
    heroImages: Array.from({ length: 12 }, (_, i) => `/barcelona${i + 1}.jpg`),
    isDebugMode: dev,
    searchEndpoint: '/api/search'
  } as const;

  // Manejadores de eventos
  function handleSearchStart(): void {
    appState = {
      ...appState,
      loading: true,
      error: '',
      data: null
    };
  }

  function handleSearchResults(event: CustomEvent<SearchResult>): void {
    appState = {
      ...appState,
      loading: false,
      data: event.detail
    };
  }

  function handleSearchError(event: CustomEvent<string>): void {
    appState = {
      ...appState,
      loading: false,
      error: event.detail || t('errors.search_failed', 'Error en la búsqueda')
    };
  }

  // Estados computados
  $: hasResults = appState.data?.results && appState.data.results.length > 0;
  $: showEmptyState = appState.data && !hasResults;
</script>

<!-- SEO Meta Tags -->
<svelte:head>
  <title>SkyArmenia - Vuelos a Armenia | Barcelona ⇄ Yerevan | Mejores Precios</title>
  <meta name="description" content="✈️ Encuentra vuelos baratos a Armenia desde Barcelona. Especialistas en rutas Barcelona-Yerevan. Compara precios, horarios y aerolíneas. ¡Reserva tu vuelo hoy!" />
  <meta name="keywords" content="vuelos armenia, vuelos yerevan, vuelos barcelona armenia, vuelos baratos armenia, billete avion armenia, sky armenia, barcelona yerevan" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://skyarmenia.com/" />
  <meta property="og:title" content="SkyArmenia - Vuelos a Armenia | Mejores Precios Barcelona ⇄ Yerevan" />
  <meta property="og:description" content="✈️ Encuentra vuelos baratos a Armenia desde Barcelona. Especialistas en rutas Barcelona-Yerevan. Compara precios y reserva tu vuelo hoy." />
  <meta property="og:image" content="https://skyarmenia.com/logo-skyarmenia.png" />
  <meta property="og:site_name" content="SkyArmenia" />
  <meta property="og:locale" content="es_ES" />
  <meta property="og:locale:alternate" content="en_US" />
  <meta property="og:locale:alternate" content="hy_AM" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="https://skyarmenia.com/" />
  <meta name="twitter:title" content="SkyArmenia - Vuelos a Armenia | Mejores Precios" />
  <meta name="twitter:description" content="✈️ Encuentra vuelos baratos a Armenia desde Barcelona. Especialistas en rutas Barcelona-Yerevan." />
  <meta name="twitter:image" content="https://skyarmenia.com/logo-skyarmenia.png" />
  <meta name="twitter:site" content="@skyarmenia" />
  <meta name="twitter:creator" content="@skyarmenia" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://skyarmenia.com/" />
  
  <!-- Alternate languages -->
  <link rel="alternate" hreflang="es" href="https://skyarmenia.com/?lang=es" />
  <link rel="alternate" hreflang="en" href="https://skyarmenia.com/?lang=en" />
  <link rel="alternate" hreflang="hy" href="https://skyarmenia.com/?lang=hy" />
  <link rel="alternate" hreflang="x-default" href="https://skyarmenia.com/" />
  
  <!-- Additional SEO -->
  <meta name="geo.region" content="ES-CT" />
  <meta name="geo.placename" content="Barcelona" />
  <meta name="geo.position" content="41.3851;2.1734" />
  <meta name="ICBM" content="41.3851, 2.1734" />
</svelte:head>

<BgCarousel images={CONFIG.heroImages} intervalMs={5000}>
  <div class="hero-wrap">
    <h1 class="hero-title">{t('hero.title', 'Find the best flights')}</h1>

    <!-- Buscador de vuelos -->
    <SearchBar
      bind:trip={searchParams.trip}
      bind:origin={searchParams.origin}
      bind:destination={searchParams.destination}
      bind:depart={searchParams.depart}
      bind:ret={searchParams.ret}
      bind:adults={searchParams.adults}
      endpoint={CONFIG.searchEndpoint}
      debug={CONFIG.isDebugMode}
      updateUrl={true}
      on:searchstart={handleSearchStart}
      on:results={handleSearchResults}
      on:error={handleSearchError}
    />

    <!-- Estado accesible para lectores de pantalla -->
    <div class="sr-only" aria-live="polite" role="status" aria-label="Estado de búsqueda">
      {#if appState.loading}
        {t('status.searching', 'Buscando vuelos...')}
      {:else if appState.error}
        {t('status.error', 'Error:')} {appState.error}
      {:else if hasResults}
        {t('status.results', 'Resultados cargados')}
      {:else if showEmptyState}
        {t('status.no_results', 'No se encontraron resultados')}
      {/if}
    </div>

    <!-- Resultados de búsqueda -->
    <section class="results-section" aria-label="Resultados de búsqueda">
      {#if appState.loading}
        <div class="status loading" role="status">
          <span class="loading-spinner" aria-hidden="true"></span>
          {t('status.searching', 'Buscando vuelos...')}
        </div>
      {:else if appState.error}
        <div class="status error" role="alert">
          <span class="error-icon" aria-hidden="true">⚠️</span>
          {appState.error}
        </div>
      {:else if hasResults}
        <ResultsList data={appState.data} />
      {:else if showEmptyState}
        <div class="status empty">
          <span class="empty-icon" aria-hidden="true">🔍</span>
          {t('status.no_results', 'No se encontraron vuelos para esta búsqueda')}
        </div>
      {/if}
    </section>
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

  /* ================================
     RESPONSIVE BREAKPOINTS
     ================================ */

  /* Large tablets y desktop pequeño */
  @media (max-width: 1024px) {
    .hero-wrap {
      width: min(95%, 100% - 2rem);
      padding-top: 6vh;
      gap: 1.25rem;
    }
    .hero-title {
      font-size: clamp(20px, 3vw + 8px, 32px);
    }
  }

  /* Tablets */
  @media (max-width: 768px) {
    .hero-wrap {
      width: min(100%, 100% - 1.5rem);
      padding-top: 4vh;
      gap: 1rem;
    }
    .hero-title {
      font-size: clamp(18px, 2.8vw + 6px, 28px);
      margin-bottom: 0.75rem;
    }
    .results-section {
      margin-top: 1rem;
    }
  }

  /* Mobile large */
  @media (max-width: 640px) {
    .hero-wrap {
      width: calc(100% - 1rem);
      gap: 0.875rem;
      padding-top: 3vh;
    }
    .hero-title {
      font-size: clamp(16px, 2.5vw + 4px, 24px);
      margin-bottom: 0.5rem;
      text-align: center;
    }
    .status {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
    }
  }

  /* Mobile small */
  @media (max-width: 480px) {
    .hero-wrap {
      width: calc(100% - 0.75rem);
      gap: 0.75rem;
      padding-top: 2vh;
    }
    .hero-title {
      font-size: clamp(14px, 2.2vw + 2px, 20px);
      line-height: 1.2;
    }
    .status {
      padding: 0.625rem 0.875rem;
      font-size: 0.8rem;
      flex-direction: column;
      text-align: center;
      gap: 0.5rem;
    }
    .loading-spinner {
      width: 0.875rem;
      height: 0.875rem;
    }
  }

  /* Mobile extra small */
  @media (max-width: 360px) {
    .hero-wrap {
      width: calc(100% - 0.5rem);
      padding-top: 1vh;
    }
    .hero-title {
      font-size: clamp(13px, 2vw, 18px);
    }
  }

  /* Landscape móviles */
  @media (max-width: 768px) and (orientation: landscape) {
    .hero-wrap {
      padding-top: 2vh;
      gap: 0.75rem;
    }
    .hero-title {
      margin-bottom: 0.25rem;
    }
  }

  /* Sección de resultados */
  .results-section {
    margin-top: 1.5rem;
    min-height: 3rem; /* Evita saltos de layout */
  }
  

  /* Estados de búsqueda */
  .status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: 0.75rem;
    font-size: 0.95rem;
    font-weight: 500;
    backdrop-filter: blur(8px);
    transition: all 0.2s ease;
  }

  .status.loading {
    background: rgba(230, 240, 255, 0.9);
    color: #1e40af;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .status.error {
    background: rgba(254, 226, 226, 0.9);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .status.empty {
    background: rgba(243, 244, 246, 0.9);
    color: #374151;
    border: 1px solid rgba(156, 163, 175, 0.3);
  }

  /* Iconos de estado */
  .loading-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .error-icon,
  .empty-icon {
    font-size: 1.1em;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ================================
     RESPONSIVE UTILITIES
     ================================ */

  /* Reducir motion para usuarios que lo prefieren */
  @media (prefers-reduced-motion: reduce) {
    .loading-spinner {
      animation: none;
      border-top-color: currentColor;
    }
    .status {
      transition: none;
    }
  }

  /* High density displays */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .hero-title {
      text-shadow: 0 0.5px 1px rgba(0,0,0,0.3);
    }
  }

  /* Contraste alto */
  @media (prefers-contrast: high) {
    .status {
      border-width: 2px;
    }
    .hero-title {
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    }
  }

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
