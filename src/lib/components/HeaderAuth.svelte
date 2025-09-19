<!-- src/lib/components/HeaderAuth.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  // Props
  export let user: any = null;
  export let loginHref = '/login';
  export let logoutHref = '/logout?redirect=/';
  // Usa aquí las clases EXACTAS de tu botón "Iniciar sesión"
  // para que el nombre y el dropdown usen la misma UI
  export let buttonClass = 'btn login'; // <-- cámbialo si tu botón tiene otras clases

  let open = false;
  let hoverTimer: any;

  // Nombre a mostrar: user_metadata.name → local-part del email → 'Mi cuenta'
  $: displayName =
    (user?.user_metadata?.name && String(user.user_metadata.name).trim()) ||
    (user?.email ? String(user.email).split('@')[0] : '') ||
    'Mi cuenta';

  function openMenu() {
    clearTimeout(hoverTimer);
    open = true;
  }
  function closeMenuDelayed() {
    hoverTimer = setTimeout(() => (open = false), 120);
  }
  function toggleMenu() {
    open = !open;
  }
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') open = false;
  }

  // Cierra al hacer click fuera
  function onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest?.('.ha-container')) open = false;
  }
  onMount(() => {
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  });
</script>

{#if user}
  <div
    class="ha-container"
    role="presentation"
    on:mouseleave={closeMenuDelayed}
    on:keydown={onKeydown}
  >
   
    <button
      type="button"
      class={buttonClass}
      aria-haspopup="menu"
      aria-expanded={open}
      on:mouseenter={openMenu}
      on:focus={openMenu}
      on:click={toggleMenu}
    >
      {displayName}
    </button>

    {#if open}
      <div
        class="ha-dropdown"
        role="menu"
        tabindex="0"
        on:mouseenter={openMenu}
      >
        <a href={logoutHref} role="menuitem" class={buttonClass}>
          Cerrar sesión
        </a>
      </div>
    {/if}
  </div>
{:else}
  <!-- Estado no autenticado: mismo botón que ya tienes -->
  <a href={loginHref} class={buttonClass}>Iniciar sesión</a>
{/if}

<style>
  /* Contenedor del área interactiva */
  .ha-container {
    position: relative;
    display: inline-block;
  }
  /* Dropdown simple: aparece justo debajo del botón */
  .ha-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: max(160px, 100%);
    z-index: 40;
    /* Si tus botones ya llevan estilo, esto no “pinta” nada extra */
    /* Si quieres separar visualmente, puedes añadir padding/margin aquí */
  }
</style>
