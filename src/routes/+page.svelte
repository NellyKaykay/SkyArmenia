<script lang="ts">
  import { onMount } from 'svelte';

  type Trip = 'oneway' | 'round';

  // Estado del formulario
  let trip: Trip = 'round';
  let origin = 'BCN';
  let destination = 'EVN';
  let depart = '';
  let ret = '';
  let adults = 1;
  let bags = 0;

  // Estado de resultados
  let loading = false;
  let error = '';
  let data: any = null;

  function readParamsFromUrl() {
    const p = new URLSearchParams(location.search);
    origin = p.get('origin') || origin;
    destination = p.get('destination') || destination;
    depart = p.get('depart') || '';
    ret = p.get('return') || '';
    trip = (p.get('trip') as Trip) === 'oneway' ? 'oneway' : 'round';
    adults = Number(p.get('adults') || 1);
    bags = Number(p.get('bags') || 0);
  }

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

  function fmtMoney(m: any) {
    if (!m) return '—';
    try {
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: m.currency || 'EUR' }).format(m.amount);
    } catch {
      return `${m.amount} ${m.currency || ''}`.trim();
    }
  }

  function hhmm(iso: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toISOString().slice(11, 16);
  }

  async function fetchResults() {
    loading = true;
    error = '';
    data = null;

    try {
      const qs = buildQuery();
      // Actualiza la URL sin recargar (para poder compartir la búsqueda)
      history.replaceState(null, '', `/?${qs}`);

      const res = await fetch(`/api/search?${qs}`);
      const json = await res.json();
      if (!json.ok) {
        error = json.error || 'Error en la búsqueda';
      } else {
        data = json;
      }
    } catch (e: any) {
      error = e?.message || 'Fallo de red';
    } finally {
      loading = false;
    }
  }

  // Botón Buscar: NO navega, solo pide /api/search y pinta debajo
  async function goSearch() {
    await fetchResults();
  }

  onMount(() => {
    readParamsFromUrl();
    if (origin && destination && depart) {
      fetchResults();
    }
  });
</script>

<style>
  .wrap { max-width: 960px; margin: 1rem auto; padding: 1rem; }
  .card { border: 1px solid var(--border, #e5e7eb); border-radius: 1rem; padding: 1rem; background: #fff; }
  .row { display: grid; grid-template-columns: repeat(6, 1fr); gap: .75rem; }
  .row > * { width: 100%; }
  .actions { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; }
  .btn { padding: .6rem 1rem; border-radius: .75rem; border: 1px solid var(--accent, #38b6ff); background: #fff; cursor: pointer; }
  .btn.primary { background: var(--accent, #38b6ff); color: #fff; border-color: transparent; }
  @media (max-width: 720px) {
    .row { grid-template-columns: 1fr 1fr; }
  }
  .list { display: grid; gap: .75rem; margin-top: 1rem; }
  .offer { border: 1px dashed var(--border, #e5e7eb); padding: .75rem; border-radius: .75rem; background: #fafafa; }
  .muted { color: #666; font-size: .9rem; }
  .pill { display:inline-block; padding:.15rem .5rem; border-radius:999px; border:1px solid #e5e7eb; font-size:.8rem; }
  h1 { margin: 0 0 .75rem 0; }
</style>

<div class="wrap">
  <h1>SkyArmenia — Buscador</h1>

  <div class="card">
    <div class="actions" style="margin-bottom:.5rem">
      <label><input type="radio" bind:group={trip} value="round"> Ida y vuelta</label>
      <label><input type="radio" bind:group={trip} value="oneway"> Solo ida</label>
    </div>

    <div class="row">
      <input placeholder="Origen (IATA)" bind:value={origin} maxlength="3" />
      <input placeholder="Destino (IATA)" bind:value={destination} maxlength="3" />
      <input type="date" placeholder="Salida" bind:value={depart} />
      <input type="date" placeholder="Regreso" bind:value={ret} disabled={trip==='oneway'} />
      <input type="number" min="1" placeholder="Adultos" bind:value={adults} />
      <input type="number" min="0" placeholder="Maletas" bind:value={bags} />
    </div>

    <div class="actions" style="margin-top:.75rem">
      <button class="btn primary" on:click={goSearch}>Buscar</button>
      <span class="muted">Consulta FlyOne + Blackstone (vía /api/search)</span>
    </div>
  </div>

  {#if loading}
    <p class="muted">Buscando…</p>
  {:else if error}
    <p style="color:#b00020">⚠️ {error}</p>
  {:else if data}
    <div class="card">
      <div class="muted">
        {data.totalOffers} ofertas · tardó {data.tookMs} ms
      </div>

      <div class="list">
        {#each data.results as r}
          <div class="offer">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong>Proveedor: {r.provider}</strong>
              <span class="pill">{r.offers.length} ofertas</span>
            </div>

            {#if r.error}
              <div style="color:#b00020; margin-top:.25rem;">Error: {r.error}</div>
            {/if}

            {#if r.offers.length > 0}
              <div class="list" style="margin-top:.5rem;">
                {#each r.offers as of}
                  <div class="card" style="padding:.6rem">
                    <div class="muted">
                      {of.cabin || 'economy'} · {of.fareClass || '—'}
                      {#if of.deeplink} · <a href={of.deeplink} target="_blank" rel="noopener">Comprar</a>{/if}
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:.35rem;">
                      <div>
                        {#if of.itinerary?.segments?.length}
                          {#each of.itinerary.segments as s, i}
                            <div>
                              {s.origin} {hhmm(s.departure)} → {s.destination} {hhmm(s.arrival)}
                              <span class="muted">({s.flightNumber})</span>
                            </div>
                          {/each}
                        {/if}
                      </div>
                      <div style="font-weight:600; font-size:1.1rem;">
                        {fmtMoney(of.price?.total)}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
