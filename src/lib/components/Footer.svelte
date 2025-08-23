<script lang="ts">
  import { onMount } from 'svelte';
  import { i18n, lang } from '$lib/i18n';

  // i18n helper
  $: _ = $lang;
  $: t = (k: string, fb?: string) => {
    const v = $i18n[k];
    return v === k ? (fb ?? k) : v;
  };

  // Parámetros de búsqueda (por defecto)
  let origin = 'BCN';
  let destination = 'EVN';
  let depart = '';
  let ret = '';
  let adults = 1;
  let bags = 0;

  // Lee los params de la URL
  function readParams() {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    origin = p.get('origin') || origin;
    destination = p.get('destination') || destination;
    depart = p.get('depart') || '';
    ret = p.get('return') || '';
    adults = Number(p.get('adults') || '1');
    bags = Number(p.get('bags') || '0');
  }

  onMount(readParams);

  // Mock de resultados
  type Flight = {
    id: string;
    carrier: string;
    from: string;
    to: string;
    departTime: string;
    arriveTime: string;
    duration: string;
    direct: boolean;
    price: number;
    bags: number;
  };

  $: results = mockResults(origin, destination, depart, ret, adults, bags);

  function mockResults(o: string, d: string, dep: string, ret: string, ad: number, b: number): Flight[] {
    const base: Flight[] = [
      {
        id: 'SKY-1001',
        carrier: 'SkyArmenia',
        from: o, to: d,
        departTime: dep || '2025-09-01T08:30',
        arriveTime: dep || '2025-09-01T12:30',
        duration: '4h 00m',
        direct: true,
        price: 179,
        bags: b
      },
      {
        id: 'FLY-2002',
        carrier: 'FLYONE',
        from: o, to: d,
        departTime: dep || '2025-09-01T15:10',
        arriveTime: dep || '2025-09-01T19:25',
        duration: '4h 15m',
        direct: true,
        price: 199,
        bags: b
      },
      {
        id: 'BLK-3003',
        carrier: 'Blackstone Air',
        from: o, to: d,
        departTime: dep || '2025-09-01T21:05',
        arriveTime: dep || '2025-09-01T01:10',
        duration: '4h 05m',
        direct: true,
        price: 209,
        bags: b
      }
    ];
    return base;
  }

  function fmtDate(s: string) {
    if (!s) return '—';
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  }

  function swap() {
    const tmp = origin;
    origin = destination;
    destination = tmp;
  }
</script>

<section class="results">
  <!-- Resumen -->
  <div class="summary">
    <div class="route">
      <span class="city">{origin}</span>
      <button class="swap" type="button" on:click={swap} aria-label="Swap">⇄</button>
      <span class="city">{destination}</span>
    </div>
    <div class="meta">
      <span>{fmtDate(depart)}{ret ? ` → ${fmtDate(ret)}` : ''}</span>
      <span>·</span>
      <span>{adults} {t('form.passengers', 'Passengers')}</span>
      <span>·</span>
      <span>{bags} {t('opts.bags', 'Bags')}</span>
    </div>
  </div>

  <!-- Controles (placeholder) -->
  <div class="controls">
    <button class="chip active">Direct</button>
    <button class="chip">Morning</button>
    <button class="chip">Afternoon</button>
    <button class="chip">Evening</button>
    <div class="spacer"></div>
    <button class="chip">Sort · Price</button>
  </div>

  <!-- Lista de resultados -->
  <div class="list">
    {#each results as r}
      <article class="card">
        <div class="left">
          <div class="carrier">{r.carrier}</div>
          <div class="times">
            <strong>{new Date(r.departTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</strong>
            <span>—</span>
            <strong>{new Date(r.arriveTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</strong>
          </div>
          <div class="sub">
            <span>{r.duration}</span>
            <span>·</span>
            <span>{r.direct ? t('flight.direct','direct') : t('flight.stops','with stops')}</span>
          </div>
        </div>

        <div class="right">
          <div class="price">€{r.price}</div>
          <button class="select">{t('form.search','Search flights')}</button>
        </div>
      </article>
    {/each}
  </div>
</section>

<style>
  .results { padding: 24px 0 48px; }

  .summary {
    display: grid;
    gap: 6px;
    margin-bottom: 16px;
  }
  .route {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 22px;
    font-weight: 800;
  }
  .city { letter-spacing: .5px; }
  .swap {
    border: 1px solid var(--border);
    background: #fff;
    border-radius: 8px;
    width: 32px; height: 32px;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer;
  }
  .meta { color: var(--muted); display: inline-flex; gap: 8px; align-items: center; }

  .controls {
    display: flex; align-items: center; gap: 8px;
    margin: 12px 0 16px;
    flex-wrap: wrap;
  }
  .chip {
    border: 1px solid var(--border);
    background: #fff;
    border-radius: 999px;
    padding: 6px 10px;
    font-weight: 600;
    cursor: pointer;
  }
  .chip.active { border-color: var(--accent); color: #000; }
  .spacer { flex: 1 1 auto; }

  .list { display: grid; gap: 12px; }

  .card {
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px;
    background: #fff;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: center;
  }
  .left { display: grid; gap: 4px; }
  .carrier { font-weight: 700; }
  .times { display: inline-flex; gap: 8px; align-items: baseline; }
  .sub { color: var(--muted); display: inline-flex; gap: 8px; }

  .right { display: grid; gap: 8px; justify-items: end; }
  .price { font-size: 22px; font-weight: 800; }
  .select {
    border: 1px solid var(--accent);
    background: #fff;
    color: #38b6ff;
    border-radius: 8px;
    padding: 6px 12px;
    font-weight: 600;
    cursor: pointer;
  }

  @media (max-width: 600px) {
    .route { font-size: 18px; }
    .price { font-size: 18px; }
  }
</style>
