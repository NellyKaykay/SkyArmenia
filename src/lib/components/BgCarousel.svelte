<script lang="ts">
  import { onMount } from 'svelte';

  // Imágenes para el fondo (requerido)
  export let images: string[] = [];

  // Intervalo entre cambios
  export let intervalMs: number = 5000;

  // Deja el mismo gradiente que usabas
  export let gradient =
    'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.25))';

  let idx = 0;
  let bg = images.length
    ? `${gradient}, url('${images[0]}')`
    : `${gradient}, url('/barcelona1.jpg')`; // fallback

  onMount(() => {
    // Precarga para evitar parpadeos
    images.forEach((src) => { const im = new Image(); im.src = src; });

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const step = () => {
      if (!images.length) return;
      idx = (idx + 1) % images.length;
      bg = `${gradient}, url('${images[idx]}')`;
    };
    const id = setInterval(step, reduce ? intervalMs * 3 : intervalMs);
    return () => clearInterval(id);
  });
</script>

<style>
  /* ===== HERO CON ALTA CALIDAD DE IMAGEN ===== */
  .hero {
    /* Optimizaciones de calidad de imagen */
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    
    /* Renderizado mejorado */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    image-rendering: auto;
    
    /* Aceleración por hardware */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    
    /* Anti-aliasing mejorado */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    
    /* Filtros para mejor calidad visual */
    filter: contrast(1.05) saturate(1.03) brightness(1.01);
    
    /* Layout y diseño */
    padding: 48px 24px;
    border-bottom: 1px solid #0a1f97;
    box-shadow: inset 0 6px 10px rgba(6, 10, 67, 0.05);
    border-radius: 8px;
    color: #fff;
    min-height: 380px;
    
    /* Transiciones suaves */
    transition: background-image 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                filter 0.3s ease;
    
    /* Optimización de performance */
    will-change: background-image;
    contain: layout style paint;
  }

  /* Efecto hover sutil para mejor interacción */
  .hero:hover {
    filter: contrast(1.08) saturate(1.05) brightness(1.02);
  }

  /* Responsive con mantener calidad */
  @media (max-width: 980px) {
    .hero { 
      padding: 40px 16px;
      /* Ajuste de filtros para pantallas medianas */
      filter: contrast(1.06) saturate(1.04) brightness(1.015);
    }
  }

  @media (max-width: 640px) {
    .hero { 
      padding: 32px 12px;
      /* Optimización para móviles */
      filter: contrast(1.08) saturate(1.06) brightness(1.025);
      background-attachment: scroll; /* Mejor performance en móvil */
      -webkit-transform: translateZ(0) scale(1);
      transform: translateZ(0) scale(1);
    }
  }

  /* Pantallas de alta densidad (Retina, 4K) */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .hero {
      /* Optimización especial para pantallas de alta densidad */
      image-rendering: -webkit-optimize-contrast;
      filter: contrast(1.03) saturate(1.02) brightness(1.005);
      -webkit-transform: translateZ(0) scale(1.001);
      transform: translateZ(0) scale(1.001);
    }
  }

  /* Mejoras para dispositivos con poca potencia */
  @media (prefers-reduced-motion: reduce) {
    .hero {
      transition: none;
      background-attachment: scroll;
      will-change: auto;
    }
  }

  /* Modo oscuro - ajuste de contraste */
  @media (prefers-color-scheme: dark) {
    .hero {
      filter: contrast(1.02) saturate(1.01) brightness(0.98);
    }
  }
</style>

<section class="hero" style:background-image={bg}>
  <slot />
</section>
