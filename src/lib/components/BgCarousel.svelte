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
  /* ===== HERO ===== */
  .hero {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    padding: 48px 24px;
    border-bottom: 1px solid #0a1f97;
    box-shadow: inset 0 6px 10px rgba(6, 10, 67, 0.05);
    border-radius: 8px;

    color: #fff;
    min-height: 380px;
  }


  @media (max-width: 980px) {
    .hero { padding: 40px 16px; }

  }
  @media (max-width: 640px) {
    .hero { padding: 32px 12px; }

  }
</style>

<section class="hero" style:background-image={bg}>
  <slot />
</section>
