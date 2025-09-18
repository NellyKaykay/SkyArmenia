<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { i18n } from '$lib/i18n';

  // ===== Estado controlado por el padre (two-way binding)
  export let trip: 'oneway' | 'round' = 'round';
  export let origin = 'BCN';
  export let destination = 'EVN';
  export let depart = '';
  export let ret = '';
  export let adults: number = 1;
  export let bags: number = 0;

  // ===== Config
  export let endpoint = '/api/search';
  export let debug = true;        // activa ?debug=1
  export let updateUrl = true;    // actualiza la barra del navegador con los params

  // ===== Estado interno (opcionalmente bindable desde el padre)
  export let loading = false;
  export let errorText = '';
  export let data: any = null;

  const dispatch = createEventDispatcher();

  // i18n helper
  $: t = (k: string, fallback?: string) => {
    const v = $i18n[k];
    return v === k ? (fallback ?? k) : v;
  };

  function buildQuery() {
    const q = new URLSearchParams({
      origin, destination, depart, trip,
      adults: String(adults), bags: String(bags)
    });
    if (trip === 'round' && ret) q.set('return', ret);
    return q.toString();
  }

  async function doSearch() {
    loading = true;
    errorText = '';
    data = null;
    dispatch('searchstart');

    try {
      const qs = buildQuery();
      if (updateUrl) history.replaceState(null, '', `/?${qs}`);
      const url = `${endpoint}?${qs}${debug ? '&debug=1' : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json.ok) {
        errorText = json.error || 'Error en la búsqueda';
        dispatch('error', errorText);
      } else {
        data = json;
        dispatch('results', data);
      }
    } catch (e: any) {
      errorText = e?.message || 'Fallo de red';
      dispatch('error', errorText);
    } finally {
      loading = false;
    }
  }

  function onSubmit(e: Event) {
    e.preventDefault();
    doSearch();
  }
</script>

<!-- Opciones superiores -->
<div class="hero-options">
  <div class="trip-group">
    <label>
      <input type="radio" bind:group={trip} value="round" />
      {t('opts.round', 'Round trip')}
    </label>
    <label>
      <input type="radio" bind:group={trip} value="oneway" />
      {t('opts.oneway', 'One-way')}
    </label>
  </div>

  <div class="bags-group">
    <label for="bags-select">{t('opts.bags', 'Bags')}:</label>
    <select
      id="bags-select"
      bind:value={bags}
      aria-label={t('opts.bags', 'Bags')}
      on:change={(e) => bags = Number((e.target as HTMLSelectElement).value)}
    >
      <option value={0}>0</option>
      <option value={1}>1</option>
      <option value={2}>2</option>
      <option value={3}>3</option>
    </select>
  </div>
</div>

<!-- Barra de búsqueda -->
<form class="search-bar" on:submit={onSubmit}>
  <!-- Origen -->
  <div>
    <label for="origin" class="label">{t('form.origin', 'Origin')}</label>
    <select id="origin" bind:value={origin} style="width:100%;" aria-label={t('form.origin', 'Origin')}>
      <option value="EVN">Yerevan (EVN)</option>
      <option value="BCN">Barcelona (BCN)</option>
      <option value="ALC">Alicante (ALC)</option>
    </select>
  </div>

  <!-- Destino -->
  <div>
    <label for="destination" class="label">{t('form.destination', 'Destination')}</label>
    <select id="destination" bind:value={destination} style="width:100%;" aria-label={t('form.destination', 'Destination')}>
      <option value="EVN">Yerevan (EVN)</option>
      <option value="BCN">Barcelona (BCN)</option>
      <option value="ALC">Alicante (ALC)</option>
    </select>
  </div>

  <!-- Salida -->
  <div>
    <label for="depart" class="label">{t('form.depart', 'Departure')}</label>
    <input id="depart" type="date" bind:value={depart} style="width:100%;" aria-label={t('form.depart', 'Departure')} />
  </div>

  <!-- Regreso -->
  <div>
    <label for="return" class="label">{t('form.return', 'Return')}</label>
    <input
      id="return"
      type="date"
      bind:value={ret}
      style="width:100%;"
      disabled={trip === 'oneway'}
      aria-label={t('form.return', 'Return')}
    />
  </div>

  <!-- Pasajeros -->
  <div>
    <label for="passengers" class="label">{t('form.passengers', 'Passengers')}</label>
    <select
      id="passengers"
      bind:value={adults}
      style="width:100%;"
      aria-label={t('form.passengers', 'Passengers')}
      on:change={(e) => adults = Number((e.target as HTMLSelectElement).value)}
    >
      <option value={1}>1</option>
      <option value={2}>2</option>
      <option value={3}>3</option>
      <option value={4}>4</option>
    </select>
  </div>

  <!-- Buscar -->
  <button type="submit" class="search-icon-btn" aria-label={t('form.search', 'Search flights')}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="ico" aria-hidden="true">
      <path
        d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"
        fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"
      />
    </svg>
  </button>
</form>

<style>
  .hero-options {
    display: flex;
    gap: 24px;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #f0f4f8;
    flex-wrap: wrap;
  }
  .trip-group label + label { margin-left: 12px; }

  .label { font-size: 12px; color: var(--muted); display: block; margin-bottom: 4px; }

  .search-bar {
    display: grid;
    gap: 35px;
    align-items: end;
    background: #ffffff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 6px 12px rgba(39, 6, 160, 0.15);
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .search-icon-btn {
    display: flex; align-items: center; justify-content: center;
    width: 44px; height: 44px; border-radius: 6px;
    border: 1px solid var(--border); background: #ffffff; color: #000;
    cursor: pointer;
  }
  .search-icon-btn .ico { width: 20px; height: 20px; }

  /* Se eliminan los estilos responsivos para mantener el diseño de escritorio en todos los tamaños */
</style>
