<script lang="ts">
  import { i18n } from '$lib/i18n';

  // Helper de traducción con fallback (igual que en tu página)
  $: t = (k: string, fallback?: string) => {
    const v = $i18n[k];
    return v === k ? (fallback ?? k) : v;
  };

  // "4 horas · directo · desde 400 €"
  function offerLine(hours: number, direct = true, price = 400, currency = '€') {
    const h = `${hours} ${t('unit.hours', 'hours')}`;
    const d = direct ? t('flight.direct', 'direct') : t('flight.stops', 'with stops');
    const from = t('price.from', 'from');
    return `${h} · ${d} · ${from} ${price} ${currency}`;
  }
</script>

<section class="offers">
  <h2 class="offers-title">{t('offers.title', 'Destinations')}</h2>

  <div class="offers-grid">
    <!-- Card 1: Yerevan -->
    <div class="offer-card1">
      <img
        src="https://ca-times.brightspotcdn.com/dims4/default/1b5cd92/2147483647/strip/true/crop/1600x534+0+201/resize/2000x667!/format/webp/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F8b%2F6d%2F8a82b3f44b62a048a080602302fb%2Fyerevan-republic-square-at-night-yerevan-armenia.jpg"
        alt="Yerevan"
        loading="lazy"
      />
      <div class="offer-body">
        <h3>{$i18n['offer.card2']}</h3>
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
        <h3>{$i18n['offer.card']}</h3>
        <p>{offerLine(4, true, 400, '€')}</p>
      </div>
    </div>
  </div>
</section>

<style>
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
</style>
