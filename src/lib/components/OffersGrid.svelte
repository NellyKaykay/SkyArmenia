<script lang="ts">
  import { i18n } from '$lib/i18n';

  // Helper de traducción con fallback
  $: t = (k: string, fallback?: string) => {
    const v = ($i18n as any)?.[k];
    return typeof v === 'string' ? v : (fallback ?? k);
  };

  // "4 horas · directo · desde 400 €"
  function offerLine(hours: number, direct = true, price = 400, currency = '€') {
    const h = `${hours} ${t('unit.hours', 'horas')}`;
    const d = direct ? t('flight.direct', 'directo') : t('flight.stops', 'con escalas');
    const from = t('price.from', 'desde');
    return `${h} · ${d} · ${from} ${price} ${currency}`;
  }
</script>

<section class="offers">
  <h2 class="offers-title">{t('offers.title', 'Destinos')}</h2>

  <div class="offers-grid">
    <!-- Card 1 -->
    <div class="offer-card">
      <img
        src="/offers/yerevan.jpg"
        alt="Ereván"
        loading="lazy"
        decoding="async"
      />
      <div class="offer-body">
        <h3>{t('offers.yerevan', 'Ereván')}</h3>
       
      </div>
    </div>

    <!-- Card 2 -->
    <div class="offer-card">
      <img
        src="/offers/barcelona.jpg"
        alt="Barcelona"
        loading="lazy"
        decoding="async"
      />
      <div class="offer-body">
        <h3>{t('offers.barcelona', 'Barcelona')}</h3>
        
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
    align-items: stretch;
  }

  .offer-card {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .offer-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0,0,0,.12);
  }

  .offer-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
    /* Mejoras de calidad profesionales para imágenes */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    image-rendering: auto;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    /* Anti-aliasing mejorado */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* Filtros para mejor nitidez y contraste */
    filter: contrast(1.08) saturate(1.05) brightness(1.02);
    object-position: center;
    /* Optimización para hardware acceleration */
    will-change: transform;
    transform-style: preserve-3d;
  }

  .offer-body {
    padding: 16px;
  }

  .offer-body h3 {
    margin: 0 0 8px;
    font-size: 18px;
    color: #000;
  }

  
  /* Responsive design para OffersGrid */
  @media (max-width: 768px) {
    .offers-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
    
    .offer-card img {
      height: 180px;
      /* Optimización adicional para móviles */
      filter: contrast(1.10) saturate(1.08) brightness(1.03);
    }
  }

  @media (max-width: 480px) {
    .offers { padding: 24px 0; }
    .offers-title { font-size: 18px; margin-bottom: 16px; }
    
    .offer-card img {
      height: 160px;
      /* Filtros más agresivos para pantallas pequeñas */
      filter: contrast(1.12) saturate(1.10) brightness(1.04);
    }
    
    .offer-body {
      padding: 14px;
    }
    
    .offer-body h3 {
      font-size: 16px;
    }
  }

  /* Pantallas de alta densidad (Retina, 4K) */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .offer-card img {
      /* Optimización especial para pantallas Retina */
      image-rendering: -webkit-optimize-contrast;
      filter: contrast(1.06) saturate(1.03) brightness(1.01);
      -webkit-transform: translateZ(0) scale(1.001);
      transform: translateZ(0) scale(1.001);
    }
  }

  /* Hover effects mejorados */
  .offer-card:hover img {
    filter: contrast(1.12) saturate(1.08) brightness(1.04);
    transform: translateZ(0) scale(1.02);
  }
</style>
