<script lang="ts">
  // ✅ i18n stores para usar $lang y $i18n
  import { i18n, lang } from '$lib/i18n';
  import { onMount } from 'svelte';

  // Forzar reactividad general (opcional si ya usas $i18n en el template)
  $: _ = $lang;

  // Helper de traducción con fallback
  $: t = (k: string, fallback?: string) => {
    const v = $i18n[k];
    return v === k ? (fallback ?? k) : v;
  };

  // ======= Estado del formulario (tu UI original) =======
  let trip: 'oneway' | 'round' = 'round';
  let origin = 'BCN';
  let destination = 'EVN';
  let depart = '';
  let ret = '';
  let adults: number = 1;
  let bags: number = 0;

  // ======= Estado de resultados inline =======
  let loading = false;
  let error = '';
  let data: any = null;

  // (Temporal) Modo debug para ver ofertas simuladas
  const USE_DEBUG = true; // TODO: false cuando FlyOne/Blackstone estén integrados

  // "4 horas · directo · desde 400 €" con i18n (sección Ofertas)
  function offerLine(hours: number, direct = true, price = 400, currency = '€') {
    const h = `${hours} ${t('unit.hours', 'hours')}`;
    const d = direct ? t('flight.direct', 'direct') : t('flight.stops', 'with stops');
    const from = t('price.from', 'from');
    return `${h} · ${d} · ${from} ${price} ${currency}`;
  }

  // ======= Helpers de búsqueda =======
  function buildQuery() {
    const q = new URLSearchParams({
      origin,
      destination,
      depart,
      trip,
      adults: String(adults),
      bags: String(bags)
    });
    if (trip === 'round' && ret) q.set('return', ret);
    return q.toString();
  }

  // 💶 Formato dinero (price.amountCents)
  function fmtMoney(m: any) {
    if (!m) return '—';
    try {
      const cents = (typeof m.amountCents === 'number')
        ? m.amountCents
        : (typeof m.amount === 'number' ? Math.round(m.amount * 100) : null);
      const currency = m.currency || 'EUR';
      if (cents == null) return '—';
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(cents / 100);
    } catch {
      if (typeof m === 'number') {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(m);
      }
      return `${m.amount ?? m.amountCents ?? ''} ${m.currency || ''}`.trim();
    }
  }

  // 🕒 Horas/fecha
  function hhmm(iso?: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
  function dshort(iso?: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }); // dd/mm
  }

  async function fetchResultsInline() {
    loading = true;
    error = '';
    data = null;
    try {
      const qs = buildQuery();
      history.replaceState(null, '', `/?${qs}`); // mantener query en URL
      const url = `/api/search?${qs}${USE_DEBUG ? '&debug=1' : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json.ok) error = json.error || 'Error en la búsqueda';
      else data = json;
    } catch (e: any) {
      error = e?.message || 'Fallo de red';
    } finally {
      loading = false;
    }
  }

  // ⛳ Acción del botón lupa — INLINE
  async function goSearch() {
    await fetchResultsInline();
  }

  // ======= Helpers UI resultados (dos columnas + expandible) =======
  // a) Aplanar ofertas (de todos los proveedores)
  $: flatOffers =
    (data?.results && Array.isArray(data.results))
      ? data.results.flatMap((r: any) =>
          (r?.offers || []).map((of: any) => ({ ...of, _provider: r.provider }))
        )
      : [];

  // b) Mapa de expandido por id
  let expanded: Record<string, boolean> = {};
  function toggle(id: string) {
    expanded[id] = !expanded[id];
  }
  function providerName(p?: string) {
    if (p === 'flyone') return 'FlyOne';
    if (p === 'blackstone') return 'Blackstone';
    return p || '—';
  }

  // c) Segmentos principales para resumen (por si los usas más tarde)
  function firstOut(of: any) { return of?.out?.segments?.[0]; }
  function firstRet(of: any) { return of?.ret?.segments?.[0]; }

  // ======= 🎠 Carrusel de fondo del HERO (barcelona1..12.jpg) =======
  const HERO_IMAGES = Array.from({ length: 12 }, (_, i) => `/barcelona${i + 1}.jpg`);
  const HERO_INTERVAL_MS = 5000; // cambia cada 5s
  let heroIdx = 0;

  // valor encadenado con el style del hero (propiedad background-image)
  let heroBg = `linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.25)), url('${HERO_IMAGES[0]}')`;

  onMount(() => {
    // Precarga para evitar parpadeos
    HERO_IMAGES.forEach(src => { const im = new Image(); im.src = src; });

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const interval = setInterval(() => {
      heroIdx = (heroIdx + 1) % HERO_IMAGES.length;
      heroBg = `linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.25)), url('${HERO_IMAGES[heroIdx]}')`;
    }, reduce ? HERO_INTERVAL_MS * 3 : HERO_INTERVAL_MS);

    return () => clearInterval(interval);
  });
</script>

<section class="hero" style:background-image={heroBg}>
  <h1 class="hero-title">{t('hero.title', 'Find the best flights')}</h1>
 

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

  <!-- Barra de búsqueda (tu diseño) -->
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

    <!-- Buscar (lupa SVG, sin fondo de color) -->
    <button type="button" class="search-icon-btn" on:click={goSearch} aria-label={t('form.search', 'Search flights')}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="ico" aria-hidden="true">
        <path
          d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>

  <!-- ===== Resultados inline debajo del buscador ===== -->
  {#if loading}
    <p style="margin-top:12px;color:#666;">{t('status.searching','Searching…')}</p>
  {:else if error}
    <p style="margin-top:12px;color:#b00020;">⚠️ {error}</p>
  {:else if data}
    <div class="results" style="margin-top:12px;">
      <div style="color:#666; margin-bottom:8px;">
        {data.totalOffers} {t('results.offers','offers')} · {t('results.took','took')} {data.tookMs} ms
      </div>

      <!-- ✅ Dos columnas, resumen en una línea y detalle expandible -->
      {#if flatOffers.length === 0}
        <p>{t('results.empty','No offers for your search.')}</p>
      {:else}
        <div class="results-grid">
          {#each flatOffers as of}
            <div class="offer">
              <!-- Resumen de una línea: proveedor · rutas + fechas · precio -->
              <button class="offer-row" on:click={() => toggle(of.id)} aria-expanded={!!expanded[of.id]}>
                <div class="row-main">
                  <span class="provider">{providerName(of._provider ?? of.provider)}</span>
                  <span class="route">
                    {#if of.out?.segments?.length}
                      {of.out.segments[0].origin} → {of.out.segments[0].destination}
                      · {dshort(of.out.segments[0].departTime)}
                    {/if}
                    {#if of.ret?.segments?.length}
                      · {of.ret.segments[0].origin} → {of.ret.segments[0].destination}
                      · {dshort(of.ret.segments[0].departTime)}
                    {/if}
                  </span>
                </div>
                <div class="row-price">{fmtMoney(of.price)}</div>
              </button>

              <!-- Detalle al hacer click -->
              {#if expanded[of.id]}
                <div class="offer-detail">
                  <div class="meta">
                    {of.cabin || 'economy'} · {t('opts.bags','Bags')}: {of.bagsIncluded ?? 0}
                  </div>

                  {#if of.out}
                    <div class="leg">
                      <strong>{t('results.out','Outbound')}:</strong>
                      {#each of.out.segments as s}
                        <div class="seg">
                          {s.origin} {hhmm(s.departTime)} → {s.destination} {hhmm(s.arriveTime)}
                          {#if s.flightNumber}<span class="fn">({s.flightNumber})</span>{/if}
                        </div>
                      {/each}
                      {#if of.out.durationMin}
                        <div class="dur">{t('results.duration','Duration')}: {of.out.durationMin} min</div>
                      {/if}
                    </div>
                  {/if}

                  {#if of.ret}
                    <div class="leg">
                      <strong>{t('results.ret','Return')}:</strong>
                      {#each of.ret.segments as s}
                        <div class="seg">
                          {s.origin} {hhmm(s.departTime)} → {s.destination} {hhmm(s.arriveTime)}
                          {#if s.flightNumber}<span class="fn">({s.flightNumber})</span>{/if}
                        </div>
                      {/each}
                      {#if of.ret.durationMin}
                        <div class="dur">{t('results.duration','Duration')}: {of.ret.durationMin} min</div>
                      {/if}
                    </div>
                  {/if}

                  <div class="total">{fmtMoney(of.price)}</div>

                  {#if of.deepLink}
                    <a class="deeplink" href={of.deepLink} target="_blank" rel="noopener">
                      {t('cta.buy','Buy')} → {providerName(of._provider ?? of.provider)}
                    </a>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</section>

<!-- Sección de ofertas (sin cambios en tu diseño) -->
<section class="offers">
  <h2 class="offers-title">{t('offers.title', 'Destinations')}</h2>

  <div class="offers-grid">
    <!-- Card 1: Yerevan -->
    <div class="offer-card">
      <img
        src="https://ca-times.brightspotcdn.com/dims4/default/1b5cd92/2147483647/strip/true/crop/1600x534+0+201/resize/2000x667!/format/webp/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F8b%2F6d%2F8a82b3f44b62a048a080602302fb%2Fyerevan-republic-square-at-night-yerevan-armenia.jpg"
        alt="Yerevan"
        loading="lazy"
      />
      <div class="offer-body">
        <h3>Erevan</h3>
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

   </div>
    
 
</section>

<style>
  /* ===== HERO ===== */
  .hero {
    /* Fallback inicial por si tarda en montar el script */
    background-image:
      linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.25)),
      url('/barcelona1.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    padding: 48px 24px;
    border-bottom: 1px solid #0a1f97;
    /* ✅ corregido: espacio antes de rgba y paréntesis final */
    box-shadow: inset 0 6px 10px rgba(6, 10, 67, 0.05);
    border-radius: 8px;

    color: #fff;
    min-height: 380px;
  }
  .hero-title {
    font-weight: 400;
    font-size: 32px;
    margin: 0 0 80px;
    color: #fff; /* sobre foto */
    text-shadow: 0 1px 2px rgba(0,0,0,0.25);
  }
 
  .hero-options {
    display: flex;
    gap: 24px;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #f0f4f8; /* labels claros sobre imagen */
    flex-wrap: wrap;
  }
  .trip-group label + label { margin-left: 12px; }

  .label { font-size: 12px; color: var(--muted); display: block; margin-bottom: 4px; }

  /* ===== Buscador ===== */
  .search-bar {
    display: grid;
    gap: 35px;
    align-items: end;

    background: #ffffff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 6px 12px rgba(39, 6, 160, 0.15);

    grid-template-columns:
      minmax(180px, 1fr)  /* origin */
      minmax(180px, 1fr)  /* destination */
      minmax(160px, 1fr)  /* depart */
      minmax(160px, 1fr)  /* return */
      minmax(140px, 1fr)  /* passengers */
      auto;               /* search button */
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

  /* ===== Resultados (nuevo layout) ===== */
  .results-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr)); /* ✅ dos columnas */
    gap: 12px;
  }
  @media (max-width: 980px) {
    .results-grid { grid-template-columns: 1fr; } /* móvil: una columna */
  }

  .offer {
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,.05);
    overflow: hidden;
  }
  .offer-row {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto; /* resumen + precio */
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    background: #fff;
    border: none;
    cursor: pointer;
    text-align: left;
  }
  .offer-row:hover { background: #fafafa; }
  .row-main { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .provider { font-weight: 700; color: #111; }
  .route { color: #333; }
  .row-price { font-weight: 800; font-size: 1.05rem; }

  .offer-detail {
    border-top: 1px dashed var(--border, #e5e7eb);
    padding: 10px 12px 12px;
    display: grid;
    gap: 8px;
  }
  .meta { color: #555; }
  .leg { display: grid; gap: 4px; }
  .seg { color: #222; }
  .fn { color: #888; margin-left: 4px; }
  .dur { color: #666; }
  .total { font-weight: 800; margin-top: 4px; }
  .deeplink {
    display: inline-block;
    margin-top: 4px;
    padding: 6px 10px;
    border: 1px solid var(--accent, #38bdf8);
    border-radius: 10px;
    background: #fff;
    color: #06b6d4;
    text-decoration: none;
    font-weight: 700;
  }

  /* ===== Ofertas (homepage) ===== */
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
    

    /* buscador a 2 columnas */
    .search-bar { grid-template-columns: 1fr 1fr; gap: 10px; }
    .search-icon-btn { width: 100%; height: 44px; }
  }

  @media (max-width: 640px) {
    .hero { padding: 32px 12px; }
    .hero-title { font-size: 24px; margin-bottom: 28px; }
    

    /* buscador en 1 columna */
    .search-bar { grid-template-columns: 1fr; gap: 8px; }
    .search-icon-btn { width: 100%; height: 44px; }

    .hero-options { gap: 12px; }
    .trip-group label + label { margin-left: 8px; }
  }
</style>
