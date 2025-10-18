<!-- src/lib/components/Header.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { lang, setLang, i18n, languages, type Lang } from '$lib/i18n';

  // Props externas
  export let session: any;
  export let userName: string | null = null;

  // Idioma actual (reactivo al store)
  let current: Lang = 'es';
  $: current = $lang;

  // Hrefs que preservan el ?lang=actual
  $: homeHref = `/?lang=${current}`;
  $: loginHref = `/login?lang=${current}`;

  // Estado UI
  let scrolled = false;
  let open = false;
  let dropdownEl: HTMLElement | null = null;
  let buttonEl: HTMLButtonElement | null = null;
  const menuId = 'account-menu';

  function toggle() { open = !open; }
  function close() { open = false; }

  function onDocClick(e: MouseEvent) {
    const t = e.target as Node;
    if (!dropdownEl || !buttonEl) return;
    if (!dropdownEl.contains(t) && !buttonEl.contains(t)) close();
  }
  function onDocKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  onMount(() => {
    const onScroll = () => { scrolled = window.scrollY > 4; };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onDocKey);
    };
  });

  /** i18n reactivo: fuerza dependencia a $i18n para que Svelte recalcule */
  $: t = (key: string, fallback: string) => {
    const dict = $i18n as Record<string, string> | undefined;
    const v = dict?.[key];
    return v && v !== key ? v : fallback;
  };

  // Etiquetas accesibles y visibles (dependen de $i18n)
  $: labelLanguage = t('footer.language', 'Language');
  $: labelLogin    = t('auth.login.title', 'Login');
  $: labelLogout   = t('nav.logout', 'Logout');
  $: labelAccount  = t('nav.profile', 'My Account');

  // Texto del botón cuando hay sesión
  $: displayName = (userName && userName.trim()) || labelAccount;
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
    min-height: 72px;
    gap: 16px;
  }

  /* Logo */
  .logo { height: 140px; width: auto; display: block; }
  .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }

  /* Controles derecha */
  .ctrls { display: flex; align-items: center; gap: 12px; }

  .lang {
    border: 1px solid var(--border);
    background: #fff; color: #000;
    padding: 8px 10px; border-radius: 8px; min-height: 40px;
  }

  /* Botón base (login y también item de logout) */
  .btn {
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
    transition: background .2s ease, box-shadow .2s ease;
  }
  .btn:hover { background: #f7f7f7; }

  /* Dropdown */
  .dropdown { position: relative; display: inline-block; }
  .menu {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    min-width: 200px;
    background: #fff;
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 8px;
    box-shadow: 0 10px 24px rgba(0,0,0,.08);
    padding: 6px;
    z-index: 1500;
  }
  .menu form { margin: 0; }
  .logout-btn { width: 100%; justify-content: flex-start; text-align: left; }

  /* A11y helper */
  .sr-only { position:absolute; left:-9999px; top:auto; width:1px; height:1px; overflow:hidden; }

  /* ---------- Responsive ---------- */
  @media (max-width: 900px) {
    .logo { height: 120px; }
    .header-inner { min-height: 68px; }
  }
  @media (max-width: 600px) {
    .logo { height: 100px; }
    .header-inner {
      flex-direction: column; align-items: stretch;
      padding: 12px 0; gap: 10px; min-height: unset;
    }
    .brand { justify-content: center; }
    .ctrls { width: 100%; gap: 8px; justify-content: center; flex-wrap: wrap; }
    .lang { flex: 1 1 160px; min-width: 140px; }
    .btn  { flex: 1 1 140px; min-width: 120px; }
  }
</style>

<!-- Header -->
<div class="header" class:is-scrolled={scrolled}>
  <div class="container header-inner">
    <a href={homeHref} class="brand" aria-label="SkyArmenia Home">
      <img src="/logo-skyarmenia.svg" alt="SkyArmenia" class="logo" />
    </a>

    <div class="ctrls">
      <label class="sr-only" for="lang-select">{labelLanguage}</label>
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

      {#if session}
        <!-- Botón con nombre + dropdown -->
        <div class="dropdown" bind:this={dropdownEl}>
          <button
            type="button"
            class="btn"
            aria-label={labelAccount}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={menuId}
            on:click={toggle}
            bind:this={buttonEl}
          >
            {displayName}
          </button>

          {#if open}
            <div class="menu" id={menuId} role="menu">
              <form method="POST" action="/logout" class="logout-form">
                <button type="submit" class="btn logout-btn" role="menuitem">
                  {labelLogout}
                </button>
              </form>
            </div>
          {/if}
        </div>
      {:else}
        <!-- Aquí usamos la etiqueta reactiva -->
        <a class="btn" href={loginHref}>{labelLogin}</a>
      {/if}
    </div>
  </div>
</div>
