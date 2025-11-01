<script lang="ts">
  import { onMount } from 'svelte';
  import { lang, setLang, i18n, languages } from '$lib/i18n';
  import type { Lang } from '$lib/i18n';
  import UserMenu from './UserMenu.svelte';
  // Props externas
  export let session: any = null;
  export let userName: string | null = null;

  // Preparar datos del usuario para UserMenu
  $: user = session ? {
    email: session.user?.email,
    user_metadata: {
      name: userName || session.user?.user_metadata?.name
    }
  } : null;

  // Estado reactivo
  let current: Lang = 'es';
  $: current = $lang;

  // URLs que preservan el idioma actual
  $: homeHref = `/?lang=${current}`;
  $: loginHref = `/login?lang=${current}`;

  // Estado UI
  let scrolled = false;
  let open = false;
  let dropdownEl: HTMLElement | null = null;
  let buttonEl: HTMLButtonElement | null = null;
  const menuId = 'account-menu';

  // Funciones del menú
  function toggle() { 
    open = !open; 
  }
  
  function close() { 
    open = false; 
  }

  // Event handlers
  function onDocClick(e: MouseEvent) {
    const target = e.target as Node;
    if (!dropdownEl || !buttonEl) return;
    if (!dropdownEl.contains(target) && !buttonEl.contains(target)) {
      close();
    }
  }

  function onDocKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }

  // Inicialización
  onMount(() => {
    const handleScroll = () => { 
      scrolled = window.scrollY > 4; 
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKey);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onDocKey);
    };
  });

  // Helper de traducción reactivo
  $: t = (key: string, fallback: string) => {
    const dict = $i18n as Record<string, string> | undefined;
    const value = dict?.[key];
    return value && value !== key ? value : fallback;
  };

  // Etiquetas traducidas (reactivas a $i18n)
  $: labelLanguage = t('header.language', 'Idioma');
  $: labelLogin = t('auth.login.title', 'Iniciar sesión');
  $: labelLogout = t('nav.logout', 'Cerrar sesión');
  $: labelAccount = t('nav.account', 'Mi cuenta');

  // Nombre de usuario a mostrar
  $: displayName = (userName && userName.trim()) || labelAccount;
</script>

<style>
  /* Variables CSS profesionales */
  :global(:root) {
    --header-bg: #ffffff;
    --header-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    --header-border: rgba(0, 0, 0, 0.08);
    --header-text: #1f2937;
    --header-accent: #0ea5b5;
    --header-hover: #f7f9fc;
    --header-radius: 8px;
    --header-transition: all 0.2s ease;
  }

  /* Header principal */
  .header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: var(--header-bg);
    border-bottom: 1px solid var(--header-border);
    transition: var(--header-transition);
  }

  .header.is-scrolled {
    box-shadow: var(--header-shadow);
    backdrop-filter: saturate(120%) blur(6px);
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 72px;
    gap: 16px;
  }

  /* Logo y marca */
  .logo { 
    height: 140px; 
    width: auto; 
    display: block;
    /* Mejoras de calidad para el logo */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    image-rendering: pixelated;
    image-rendering: auto;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    /* Anti-aliasing mejorado */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* Filtros para mejor nitidez */
    filter: contrast(1.1) saturate(1.05);
    object-fit: contain;
    object-position: center;
  }
  
  .brand { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    text-decoration: none;
    transition: var(--header-transition);
    /* Optimización para el contenedor */
    will-change: transform;
    transform-style: preserve-3d;
  }

  .brand:hover {
    transform: scale(1.02);
  }

  .brand:focus-visible {
    outline: 2px solid var(--header-accent);
    outline-offset: 2px;
    border-radius: var(--header-radius);
  }

  /* Controles de la derecha */
  .ctrls { 
    display: flex; 
    align-items: center; 
    gap: 12px; 
  }

  /* Selector de idioma con ícono */
  .lang-selector {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .globe-icon {
    position: absolute;
    left: 8px;
    z-index: 1;
    color: #2563eb;
    transition: var(--header-transition);
    pointer-events: none;
  }

  .lang {
    border: 1px solid var(--header-border);
    background: var(--header-bg); 
    color: var(--header-text);
    padding: 8px 10px 8px 32px; /* padding-left aumentado para el ícono */
    border-radius: var(--header-radius); 
    min-height: 40px;
    font-weight: 500;
    transition: var(--header-transition);
    cursor: pointer;
    appearance: none;
    min-width: 70px;
  }

  .lang:hover {
    background: var(--header-hover);
    border-color: var(--header-accent);
  }

  
  .lang-selector:hover .globe-icon {
    color: var(--header-accent);
  }

  .lang:focus {
    outline: 2px solid var(--header-accent);
    outline-offset: 2px;
    border-color: var(--header-accent);
  }

  /* Botón base (login y logout) - moved to UserMenu.svelte to avoid unused selector warning */
  /* Button styles are now defined in UserMenu.svelte where the .btn class is actually used. */

  /* Dropdown del usuario */
  .dropdown { 
    position: relative; 
    display: inline-block; 
  }

  :global(.menu) {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    min-width: 200px;
    background: var(--header-bg);
    border: 1px solid var(--header-border);
    border-radius: var(--header-radius);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
    padding: 6px;
    z-index: 1500;
  }

  /* Reset for forms inside global menus was removed from Header because the Header
     doesn't contain the form; move this rule into UserMenu.svelte if a form needs it. */

 

 

  /* Accesibilidad */
  .sr-only { 
    position: absolute; 
    left: -9999px; 
    top: auto; 
    width: 1px; 
    height: 1px; 
    overflow: hidden; 
  }

  /* Responsive design */
  @media (max-width: 900px) {
    .logo { 
      height: 80px;
      /* Mantener calidad en pantallas medianas */
      filter: contrast(1.08) saturate(1.03);
    }
    .header-inner { min-height: 68px; }
  }

  @media (max-width: 600px) {
    .logo { 
      height: 50px;
      /* Optimización extra para móviles */
      filter: contrast(1.12) saturate(1.08) brightness(1.02);
      -webkit-transform: translateZ(0) scale(1);
      transform: translateZ(0) scale(1);
    }
    .header-inner {
      padding: 8px 16px; 
      gap: 8px; 
      min-height: 60px;
      /* Mantener layout horizontal como desktop */
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
    .brand { 
      /* Logo más compacto pero visible */
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .ctrls { 
      display: flex;
      gap: 8px; 
      align-items: center;
      flex-shrink: 0;
    }
    .lang-selector { 
      flex: 0 0 auto; 
    }
    .lang { 
      min-width: 50px;
      padding: 4px 6px 4px 26px;
      min-height: 32px;
      font-size: 12px;
      border: 1px solid var(--header-border);
      background: var(--header-bg);
    }
    .globe-icon {
      width: 14px;
      height: 14px;
      left: 6px;
    }
    .dropdown {
      flex-shrink: 0;
    }
   
  }

  /* Pantallas de alta densidad (Retina, 4K) */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .logo {
      /* Optimización especial para pantallas Retina */
      image-rendering: -webkit-optimize-contrast;
      filter: contrast(1.05) saturate(1.02) brightness(1.01);
      -webkit-transform: translateZ(0) scale(1.001);
      transform: translateZ(0) scale(1.001);
    }
  }

  /* Mejoras adicionales para SVG */
  .logo[src$=".png"] {
    /* Optimización específica para SVG */
    shape-rendering: geometricPrecision;    
  }
</style>

<!-- Header restaurado con código profesional -->
<div class="header" class:is-scrolled={scrolled}>
  <div class="container header-inner">
    <a href={homeHref} class="brand" aria-label="SkyArmenia Home">
      <img src="/logo-skyarmenia.png" alt="SkyArmenia" class="logo" />
    </a>

    <div class="ctrls">
      <label class="sr-only" for="lang-select">{labelLanguage}</label>
      <div class="lang-selector">
        <svg class="globe-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <select
          id="lang-select"
          class="lang"
          aria-label={labelLanguage}
          bind:value={current}
          on:change={(e) => setLang((e.target as HTMLSelectElement).value as Lang)}
        >
          {#each languages as l}
            <option value={l}>{l.toUpperCase()}</option>
          {/each}
        </select>
      </div>

      <!-- UserMenu mejorado -->
      <div class="dropdown">
        <UserMenu {user} />
      </div>
    </div>
  </div>
</div>
