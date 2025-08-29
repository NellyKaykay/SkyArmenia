<script lang="ts">
  // ✅ i18n stores para usar $lang y $i18n
  import { i18n, lang } from '$lib/i18n';

  // Forzar reactividad general (opcional si ya usas $i18n en el template)
  $: _ = $lang;

  // Helper de traducción con fallback
  $: t = (k: string, fallback?: string) => {
    const v = $i18n[k];
    return v === k ? (fallback ?? k) : v;
  };

  let trip: 'oneway' | 'round' = 'round';
  let origin = 'BCN';
  let destination = 'EVN';
  let depart = '';
  let ret = '';
  let adults: number = 1;
  let bags: number = 0;

  function goSearch() {
    const params = new URLSearchParams({
      origin,
      destination,
      depart,
      ...(trip === 'round' && ret ? { return: ret } : {}),
      adults: String(adults),
      bags: String(bags)
    });
    // Solo cliente (no SSR)
    window.location.href = `/flights?${params.toString()}`;
  }

  // "4 horas · directo · desde 400 €" con i18n
  function offerLine(hours: number, direct = true, price = 400, currency = '€') {
    const h = `${hours} ${t('unit.hours', 'hours')}`;
    const d = direct ? t('flight.direct', 'direct') : t('flight.stops', 'with stops');
    const from = t('price.from', 'from');
    return `${h} · ${d} · ${from} ${price} ${currency}`;
  }
</script>

<section class="hero">
  <h1 class="hero-title">{t('hero.title', 'Find the best flights')}</h1>
  <p class="hero-subtitle">{t('hero.subtitle', 'Compare on Skyarmenia and book in minutes.')}</p>

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
      <select id="bags-select" bind:value={bags} aria-label={t('opts.bags', 'Bags')}>
        <option value={0}>0</option>
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
      </select>
    </div>
  </div>

  <!-- Barra de búsqueda -->
  <div class="search-bar">
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
      <select id="passengers" bind:value={adults} style="width:100%;" aria-label={t('form.passengers', 'Passengers')}>
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
        <option value={4}>4</option>
      </select>
    </div>

    <!-- Buscar (lupa SVG, sin fondo de color) -->
    <button type="button" class="search-icon-btn" on:click={goSearch} aria-label={t('form.search', 'Search flights')}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="ico" aria-hidden="true">
        <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Promoción (igual que Login: fondo blanco, borde accent, texto celeste) -->
    <a href="/deals" class="promo-btn" aria-label={t('form.promo', 'Promotion')}>
      {t('form.promo', 'Promotion')}
    </a>
  </div>
</section>

<!-- Sección de ofertas -->
<section class="offers">
  <h2 class="offers-title">{t('offers.title', 'Travel deals with promotion')}</h2>

  <div class="offers-grid">
    <!-- Card 1: Yerevan -->
    <div class="offer-card">
      <img
        src="https://ca-times.brightspotcdn.com/dims4/default/1b5cd92/2147483647/strip/true/crop/1600x534+0+201/resize/2000x667!/format/webp/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F8b%2F6d%2F8a82b3f44b62a048a080602302fb%2Fyerevan-republic-square-at-night-yerevan-armenia.jpg"
        alt="Yerevan"
        loading="lazy"
      />
      <div class="offer-body">
        <h3>Yerevan</h3>
        <p>{offerLine(4, true, 400, '€')}</p>
      </div>
    </div>

    <!-- Card 2: Barcelona -->
    <div class="offer-card">
      <img
        src="https://images.unsplash.com/photo-1628612773214-0d5a10cfcae8?q=80&w=1200&auto=format&fit=crop"
        alt="Barcelona"
        loading="lazy"
      />
      <div class="offer-body">
        <h3>Barcelona</h3>
        <p>{offerLine(4, true, 400, '€')}</p>
      </div>
    </div>

    <!-- Card 3: Alicante -->
    <div class="offer-card">
      <img
        src="https://alicanteturismo.com/wp-content/uploads/2024/06/Explanada-de-espana.jpg"
        alt="Alicante"
        loading="lazy"
      />
      <div class="offer-body">
        <h3>Alicante ({t('status.soon', 'Soon...')})</h3>
        <p>{offerLine(4, true, 400, '€')}</p>
      </div>
    </div>
  </div>
</section>

<style>
  /* ===== HERO ===== */
  .hero {
    background: linear-gradient(200deg, #e6f6f9 0%, #fbfcfc 100%);
    padding: 48px 24px;
    border-bottom: 1px solid #2a2b31;
    box-shadow: inset 0 1px 4px rgba(188, 197, 223, 0.05);
    border-radius: 8px;
  }
  .hero-title {
    font-weight: 400;
    font-size: 32px;
    margin: 0 0 80px;
    color: #000;
  }
  .hero-subtitle {
    margin: 0 0 24px;
    color: #38b6ff;
    font-size: 16px;
  }
  .hero-options {
    display: flex;
    gap: 24px;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--muted);
    flex-wrap: wrap;
  }
  .trip-group label + label { margin-left: 12px; }

  .label { font-size: 12px; color: var(--muted); display: block; margin-bottom: 4px; }

  /* ===== Buscador ===== */
  .search-bar {
    display: grid;
    gap: 12px;
    align-items: end;
    background: #fff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    /* Desktop: 3 columnas amplias + 2 medianas + botón + promo */
    grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) minmax(160px, 1fr)
                           minmax(160px, 1fr) minmax(140px, 1fr)
                           auto minmax(140px, 1fr);
  }

  /* Botón icono buscar (sin fondo de color) */
  .search-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: #ffffff;
    color: #000;
    cursor: pointer;
  }
  .search-icon-btn .ico { width: 20px; height: 20px; }

  /* Botón promoción (igual que Login) */
  .promo-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    background: #fff;
    color: #38b6ff;
    border: 1px solid var(--accent);
    min-height: 44px;
  }

  /* ===== Ofertas ===== */
  .offers { padding: 36px 0; }
  .offers-title { font-weight: 300; font-size: 20px; margin-bottom: 20px; }
  .offers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
  }
  .offer-card {
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .offer-card:hover { transform: translateY(-4px); box-shadow: 0 6px 16px rgba(0,0,0,.12); }
  .offer-card img { width: 100%; height: 200px; object-fit: cover; display: block; }
  .offer-body { padding: 16px; }
  .offer-body h3 { margin: 0 0 8px; font-size: 18px; color: #000; }
  .offer-body p { margin: 0; color: var(--muted); font-size: 14px; }

  /* ===== Responsive ===== */
  @media (max-width: 980px) {
    .hero { padding: 40px 16px; }
    .hero-title { font-size: 28px; margin-bottom: 48px; }
    .hero-subtitle { font-size: 15px; }

    /* buscador a 2 columnas */
    .search-bar { grid-template-columns: 1fr 1fr; gap: 10px; }
    .search-icon-btn, .promo-btn { width: 100%; height: 44px; }
  }

  @media (max-width: 640px) {
    .hero { padding: 32px 12px; }
    .hero-title { font-size: 24px; margin-bottom: 28px; }
    .hero-subtitle { font-size: 14px; margin-bottom: 16px; }

    /* buscador en 1 columna */
    .search-bar { grid-template-columns: 1fr; gap: 8px; }
    .search-icon-btn, .promo-btn { width: 100%; height: 44px; }

    .hero-options { gap: 12px; }
    .trip-group label + label { margin-left: 8px; }
  }
</style>
