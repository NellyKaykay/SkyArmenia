<script lang="ts">
  import { onMount } from 'svelte';
  import { lang, setLang, i18n, languages } from '$lib/i18n';
  import type { Lang } from '$lib/i18n';

  // Props actuales
  export let session: any;
  // Opcional: nombre a mostrar tras login (user_metadata.name)
  export let userName: string | null = null;

  // Idioma
  let current: Lang = 'es';
  $: current = $lang;

  // Sombra header
  let scrolled = false;

  // Dropdown
  let open = false;
  let dropdownEl: HTMLElement | null = null;
  let buttonEl: HTMLButtonElement | null = null;

  function toggle() {
    open = !open;
  }
  function close() {
    open = false;
  }

  function onDocClick(e: MouseEvent) {
    const t = e.target as Node;
    if (!dropdownEl || !buttonEl) return;
    if (!dropdownEl.contains(t) && !buttonEl.contains(t)) {
      close();
    }
  }

  onMount(() => {
    const onScroll = () => { scrolled = window.scrollY > 4; };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    document.addEventListener('click', onDocClick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onDocClick);
    };
  });

  // Texto del botón cuando hay sesión
  $: displayName = (userName && userName.trim()) || 'Mi cuenta';
</script>

<style>
  /* ---------- Header ---------- */
  .header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: #fff;
    border-bottom: 1px solid var(--border);
    transition: box-shadow .2s ease, backdrop-filter .2s ease;
  }
  .header.is-scrolled {
    box-shadow: 0 4px 16px rgba(0,0,0,.06);
    backdrop-filter: saturate(120%) blur(6px);
  }
  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 80px;
    gap: 16px;
  }

  /* Logo */
  .logo { height: 160px; width: auto; display: block; }

  .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
  .ctrls { display: flex; align-items: center; gap: 12px; }

  .lang {
    border: 1px solid var(--border);
    background: #fff; color: #000;
    padding: 8px 10px; border-radius: 8px; min-height: 40px;
  }

  /* Botón base que ya usas para "Iniciar sesión" */
  .login {
    padding: 6px 12px;
    border: 1px solid var(--accent);
    border-radius: 8px;
    font-weight: 600;
    color: #000;
    background: #fff;
    text-decoration: none;
    min-height: 40px;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer;
  }
  .login:hover { background: #f7f7f7; }

  .logout-form { display: inline; }

  /* ▼ Dropdown minimal */
  .dropdown {
    position: relative;
    display: inline-block;
  }
  .menu {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    min-width: 180px;
    background: #fff;
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 8px;
    box-shadow: 0 10px 24px rgba(0,0,0,.08);
    padding: 6px;
    z-index: 1500;
  }
  .menu form { margin: 0; }

  /* ✅ El botón de "Cerrar sesión" hereda .login (mismo borde/estilo),
     y le damos ancho 100% y texto a la izquierda */
  .logout-btn {
    width: 100%;
    justify-content: flex-start;
    text-align: left;
  }

  /* ---------- Responsive (solo header) ---------- */
  @media (max-width: 900px) {
    .logo { height: 180px; }
    .header-inner { min-height: 80px; }
  }
  @media (max-width: 600px) {
    .logo { height: 160px; }
    .header-inner {
      flex-direction: column; align-items: stretch;
      padding: 12px 0; gap: 10px; min-height: unset;
    }
    .brand { justify-content: center; }
    .ctrls { width: 100%; gap: 8px; justify-content: center; flex-wrap: wrap; }
    .lang { flex: 1 1 160px; min-width: 140px; }
    .login { flex: 1 1 140px; min-width: 120px; }
  }
</style>

<!-- Header -->
<div class="header" class:is-scrolled={scrolled}>
  <div class="container header-inner">
    <a href="/" class="brand" aria-label="SkyArmenia Home">
      <img
        src="/logo-skyarmenia.svg"
        alt="SkyArmenia"
        class="logo"
      />
    </a>

    <div class="ctrls">
      <select
        class="lang"
        aria-label={$i18n['footer.language']}
        bind:value={current}
        on:change={(e) => setLang((e.target as HTMLSelectElement).value as Lang)}
      >
        {#each languages as l}
          <option value={l}>{l.toUpperCase()}</option>
        {/each}
      </select>

      {#if session}
        <!-- Botón con nombre + dropdown -->
        <div class="dropdown" bind:this={dropdownEl}>
          <button
            class="login"
            aria-haspopup="menu"
            aria-expanded={open}
            on:click|preventDefault={toggle}
            bind:this={buttonEl}
          >
            {displayName}
          </button>

          {#if open}
            <div class="menu" role="menu">
              <form method="POST" action="/logout" class="logout-form">
                <!-- 👇 Igual estilo que .login gracias a herencia + ajustes de ancho/alineación -->
                <button type="submit" class="login logout-btn" role="menuitem">
                  {$i18n['nav.logout'] ?? 'Cerrar sesión'}
                </button>
              </form>
            </div>
          {/if}
        </div>
      {:else}
        <a href="/login" class="login">{$i18n['nav.login']}</a>
      {/if}
    </div>
  </div>
</div>
