<!-- src/routes/login/+layout.svelte -->
<script lang="ts">
  // No cargamos nada aquí para no interferir con la navegación SPA.
  export let data: unknown;
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<!-- Muy importante para que se renderice +page.svelte -->
<slot />
