<script lang="ts">
  import { onMount } from 'svelte';
  import { lang, setLang, i18n, languages } from '$lib/i18n';
  import type { Lang } from '$lib/i18n';

  export let session: any;

  // Sincroniza el <select> con el store
  let current: Lang = 'es';
  $: current = $lang;

  // Estado para la sombra del header
  let scrolled = false;

  onMount(() => {
    const onScroll = () => { scrolled = window.scrollY > 4; };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
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
  .logo { height: 130px; width: auto; display: block; }
  .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
  .ctrls { display: flex; align-items: center; gap: 12px; }
  .lang {
    border: 1px solid var(--border);
    background: #fff; color: #000;
    padding: 8px 10px; border-radius: 8px; min-height: 40px;
  }
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

  /* ---------- Responsive (solo header) ---------- */
  @media (max-width: 900px) {
    .logo { height: 64px; }
    .header-inner { min-height: 72px; }
  }
  @media (max-width: 600px) {
    .logo { height: 50px; }
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
        <!-- Cerrar sesión (igual estilo que "Login") -->
        <form method="POST" action="/logout" class="logout-form">
          <button type="submit" class="login">{$i18n['nav.logout'] ?? 'Cerrar sesión'}</button>
        </form>
      {:else}
        <a href="/login" class="login">{$i18n['nav.login']}</a>
      {/if}
    </div>
  </div>
</div>
