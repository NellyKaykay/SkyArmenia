<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
import { onMount } from 'svelte';
import { initLang } from '$lib/i18n';
onMount(() => initLang());
  // Recibe { user } desde +layout.server.ts (usando supabase.auth.getUser())
  export let data: { user?: any };

  // Derivamos session para usarlo en el Header y evitar warnings
  const session = !!data?.user;
</script>

<svelte:head>
  <!-- Datos estructurados para Google -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": "SkyArmenia",
      "description": "Agencia de viajes especializada en vuelos entre Barcelona y Yerevan",
      "url": "https://skyarmenia.com",
      "logo": "https://skyarmenia.com/logo-skyarmenia.svg",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+34644393949",
        "email": "info@skyarmenia.com",
        "contactType": "customer service",
        "availableLanguage": ["Spanish", "English", "Russian", "Armenian"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Carrer de Còrsega, 203, Entresuelo C",
        "addressLocality": "Barcelona",
        "postalCode": "08036",
        "addressCountry": "ES"
      },
      "sameAs": [
        "https://facebook.com/skyarmenia",
        "https://instagram.com/skyarmenia"
      ]
    }
  </script>
</svelte:head>

<!-- Header -->
<Header session={session} />

<!-- Main -->
<div class="container page">
  <slot />
</div>

<!-- Footer -->
<Footer />

<style>
  /* Contenedor general */
  .container {
    width: min(1200px, 100% - 32px);
    margin: 0 auto;
  }

  .page {
    padding-top: 0;
    min-height: 40vh; /* asegura altura mínima para que el footer no “suba” demasiado */
  }

  @media (max-width: 600px) {
    .container {
      width: min(100%, 100% - 24px);
    }
  }
</style>
