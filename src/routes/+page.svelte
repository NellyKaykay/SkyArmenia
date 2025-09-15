<script lang="ts">
  import { i18n, lang } from '$lib/i18n';
  import BgCarousel from '$lib/components/BgCarousel.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import OffersGrid from '$lib/components/OffersGrid.svelte';
  import ResultsList from '$lib/components/ResultsList.svelte';

  // i18n
  $: _ = $lang;
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
  let data: any = null;

  // Imágenes del hero
  const HERO_IMAGES = Array.from({ length: 12 }, (_, i) => `/barcelona${i + 1}.jpg`);
</script>

<BgCarousel images={HERO_IMAGES} intervalMs={5000}>
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

  <!-- Resultados inline -->
  {#if loading}
    <p style="margin-top:12px;color:#666;">{t('status.searching','Searching…')}</p>
  {:else if error}
    <p style="margin-top:12px;color:#b00020;">⚠️ {error}</p>
  {:else if data}
    <ResultsList {data} />
  {/if}
</BgCarousel>

<!-- Ofertas -->
<OffersGrid />

<style>
  /* La tipografía del título del hero está en BgCarousel, pero mantenemos por si personalizas aquí */
  .hero-title {
    font-weight: 400;
    font-size: 32px;
    margin: 0 0 80px;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.25);
  }
  @media (max-width: 980px) { .hero-title { font-size: 28px; margin-bottom: 48px; } }
  @media (max-width: 640px) { .hero-title { font-size: 24px; margin-bottom: 28px; } }
</style>
