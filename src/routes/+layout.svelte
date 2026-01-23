<!-- Layout principal de SkyArmenia -->
<svelte:head>
  <title>SkyArmenia - Vuelos entre España y Armenia</title>
  <meta name="description" content="Encuentra las mejores ofertas de vuelos entre España y Armenia. Compara precios y reserva tu viaje con SkyArmenia." />
  <link rel="canonical" href={`https://skyarmenia.com${typeof window !== 'undefined' ? window.location.pathname : ''}`}>
  <!-- Open Graph -->
  <meta property="og:title" content="SkyArmenia - Vuelos entre España y Armenia" />
  <meta property="og:description" content="Encuentra las mejores ofertas de vuelos entre España y Armenia. Compara precios y reserva tu viaje con SkyArmenia." />
  <meta property="og:url" content={`https://skyarmenia.com${typeof window !== 'undefined' ? window.location.pathname : ''}`} />
  <meta property="og:image" content="https://skyarmenia.com/og-image.png" />
</svelte:head>
<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { initLang } from '$lib/i18n';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import CookieBanner from '$lib/components/CookieBanner.svelte';
  


  // Props del servidor
  export let data: { user?: any };

  // Estado de autenticación
  $: session = !!data?.user;

  // Inicialización del idioma
  onMount(() => initLang());
</script>

<!-- Estructura semántica HTML5 -->
<div class="app-layout">
  <!-- Header sticky -->
  <Header session={session} />

  <!-- Contenido principal -->
  <main class="main-content">
    <div class="container">
      <slot />
    </div>
  </main>

  <!-- Footer -->
  <Footer />

  <!-- Cookie Banner (GDPR/RGPD) -->
  <CookieBanner />
</div>

<style>
  /* ================================
     Layout Principal - SkyArmenia
     ================================ */

  /* Contenedor de aplicación */
  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--bg, #ffffff);
  }

  /* Contenido principal flexible */
  .main-content {
    flex: 1;
    padding: 2rem 0;
    background: var(--bg, #ffffff);
  }

  /* Contenedor responsive centrado */
  .container {
    width: min(1200px, calc(100% - 2rem));
    margin: 0 auto;
    padding: 0 1rem;
  }

  /* ================================
     Responsive Breakpoints
     ================================ */

  /* Tablets */
  @media (max-width: 1024px) {
    .container {
      width: min(100%, calc(100% - 1.5rem));
      padding: 0 0.75rem;
    }
    .main-content {
      padding: 1.5rem 0;
    }
  }

  /* Mobile Large */
  @media (max-width: 768px) {
    .container {
      width: min(100%, calc(100% - 1rem));
      padding: 0 0.5rem;
    }
    .main-content {
      padding: 1rem 0;
    }
  }

  /* Mobile Small */
  @media (max-width: 480px) {
    .container {
      width: calc(100% - 0.5rem);
      padding: 0 0.25rem;
    }
    .main-content {
      padding: 0.75rem 0;
    }
  }

  /* ================================
     Utilidades de Layout
     ================================ */

  /* Espaciado vertical consistente */
  .main-content > .container > :global(* + *) {
    margin-top: 1.5rem;
  }

  /* Contenido centrado para páginas específicas */
  .main-content :global(.centered) {
    max-width: 800px;
    margin: 0 auto;
  }

  /* Grid responsive para contenido */
  .main-content :global(.content-grid) {
    display: grid;
    gap: 2rem;
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .main-content :global(.content-grid) {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (min-width: 1024px) {
    .main-content :global(.content-grid) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
