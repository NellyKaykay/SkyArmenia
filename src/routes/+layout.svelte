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
