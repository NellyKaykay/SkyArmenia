<script lang="ts">
  import { i18n } from '$lib/i18n';

  // Datos completos devueltos por /api/search (o null)
  export let data: any = null;

  // i18n helper con fallback
  $: t = (k: string, fallback?: string) => {
    const v = $i18n[k];
    return v === k ? (fallback ?? k) : v;
  };

  // Aplana ofertas de todos los proveedores
  $: flatOffers =
    (data?.results && Array.isArray(data.results))
      ? data.results.flatMap((r: any) =>
          (r?.offers || []).map((of: any) => ({ ...of, _provider: r.provider }))
        )
      : [];

  // Estado expandido por id
  let expanded: Record<string, boolean> = {};
  function toggle(id: string) { expanded[id] = !expanded[id]; }

  // Helpers visuales
  function providerName(p?: string) {
    if (p === 'flyone') return 'FlyOne';
    if (p === 'blackstone') return 'Blackstone';
    return p || '—';
  }
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
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  }
</script>

{#if data}
  <div class="results" style="margin-top:12px;">
    <div style="color:#666; margin-bottom:8px;">
      {data.totalOffers} {t('results.offers','offers')} · {t('results.took','took')} {data.tookMs} ms
    </div>

    {#if flatOffers.length === 0}
      <p>{t('results.empty','No offers for your search.')}</p>
    {:else}
      <div class="results-grid">
        {#each flatOffers as of}
          <div class="offer">
            <!-- Resumen fila -->
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

            <!-- Detalle -->
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

<style>
  .results-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  @media (max-width: 980px) { .results-grid { grid-template-columns: 1fr; } }

  .offer {
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,.05);
    overflow: hidden;
  }
  .offer-row {
    width: 100%;
    display: grid; grid-template-columns: 1fr auto;
    gap: 8px; align-items: center;
    padding: 10px 12px;
    background: #fff; border: none; cursor: pointer; text-align: left;
  }
  .offer-row:hover { background: #fafafa; }
  .row-main { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .provider { font-weight: 700; color: #111; }
  .route { color: #333; }
  .row-price { font-weight: 800; font-size: 1.05rem; }

  .offer-detail {
    border-top: 1px dashed var(--border, #e5e7eb);
    padding: 10px 12px 12px;
    display: grid; gap: 8px;
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
    background: #fff; color: #06b6d4;
    text-decoration: none; font-weight: 700;
  }
</style>
