<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';

  // ✅ i18n stores y tipos
  import { lang, setLang, i18n, languages, type Lang } from '$lib/i18n';
  // (opcional) diagnóstico
  // import * as I18N from '$lib/i18n';
  // console.log('i18n module identity:', I18N);

  // Selector de idioma sincronizado con el store (no bind a $lang)
  let current: Lang = 'es';
  $: current = $lang;

  // Helper de traducción con fallback
  $: t = (k: string, fallback?: string) => {
    const v = $i18n[k];
    return v === k ? (fallback ?? k) : v;
  };

  // Efecto sticky del header (sombra al hacer scroll)
  onMount(() => {
    const el = document.querySelector('.header');
    const onScroll = () => {
      if (!el) return;
      el.classList.toggle('is-scrolled', window.scrollY > 4);
    };
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
  /* ✅ Login negro, borde de acento (igual a tu diseño) */
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
  }
  .login:hover { background: #f7f7f7; }

  .page { padding-top: 0; }

  /* ---------- Footer ---------- */
  .footer {
    margin-top: 40px;
    background: #fafafa;
    border-top: 1px solid var(--border);
    color: #111;
  }
  .footer-top {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 24px;
    padding: 32px 0;
  }
  .footer .brand-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  .footer .brand-logo { height: 100px; width: auto; display: block; }
  .footer p { margin: 8px 0 0; color: #444; line-height: 1.5; }
  .footer h4 {
    margin: 0 0 10px;
    font-size: 14px; text-transform: uppercase; letter-spacing: .04em;
    color: #222;
  }
  .footer ul { list-style: none; margin: 0; padding: 0; }
  .footer li + li { margin-top: 8px; }
  .footer a { color: inherit; text-decoration: none; }
  .footer a:hover { text-decoration: underline; }
  .social { display: flex; gap: 10px; margin-top: 10px; }
  .social a {
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border: 1px solid var(--border); border-radius: 8px;
  }
  .social svg { width: 18px; height: 18px; }

  .footer-bottom {
    border-top: 1px solid var(--border);
    padding: 12px 0;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; font-size: 13px; color: #555;
  }
  .policy { display: flex; gap: 14px; }
  .policy a { color: inherit; text-decoration: none; }
  .policy a:hover { text-decoration: underline; }

  /* ---------- Responsive ---------- */
  @media (max-width: 900px) {
    .logo { height: 84px; }
    .header-inner { min-height: 72px; }
    .footer-top { grid-template-columns: 1.6fr 1fr 1fr; }
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
    .page { padding-top: 0; }
    .footer-top { grid-template-columns: 1fr; padding: 24px 0; }
    .footer-bottom { flex-direction: column; align-items: flex-start; gap: 8px; }
  }
</style>

<!-- Header -->
<div class="header">
  <div class="container header-inner">
    <a href="/" class="brand" aria-label="SkyArmenia Home">
      <img src="/logo-skyarmenia.png" alt="SkyArmenia" class="logo" />
    </a>

    <div class="ctrls">
      <select
        class="lang"
        aria-label={$i18n['footer.language']}
        bind:value={current}
        on:change={(e)=> setLang((e.target as HTMLSelectElement).value as Lang)}
      >
        {#each languages as l}
          <option value={l}>{l.toUpperCase()}</option>
        {/each}
      </select>

      <a href="/login" class="login">{$i18n['nav.login']}</a>
    </div>
  </div>
</div>

<!-- Main -->
<div class="container page">
  <slot />
</div>

<!-- Footer -->
<footer class="footer">
  <div class="container footer-top">
    <!-- Brand / About -->
    <div>
      <div class="brand-row">
        <img src="/logo-skyarmenia.png" alt="SkyArmenia" class="brand-logo" />
      </div>
      <p>{$i18n['footer.about']}</p>

      <div class="social" aria-label="Social links">
        <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M14 9h3V6h-3c-1.66 0-3 1.34-3 3v3H8v3h3v6h3v-6h3l1-3h-4V9c0-.55.45-1 1-1Z"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
          </svg>
        </a>
        <a href="https://x.com" target="_blank" rel="noopener" aria-label="X">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M22 12s0-3-1-4c-1-1-5-1-9-1s-8 0-9 1-1 4-1 4 0 3 1 4 5 1 9 1 8 0 9-1 1-4 1-4Z"
              stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 9.5v5l4-2.5-4-2.5Z" fill="currentColor"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- Links -->
    <div>
      <h4>{$i18n['footer.links']}</h4>
      <ul>
        <li><a href="/about">{$i18n['nav.about']}</a></li>
        <li><a href="/events">{$i18n['nav.events']}</a></li>
        <li><a href="/flights">{$i18n['nav.flights']}</a></li>
        <li><a href="/contact">{$i18n['nav.contact']}</a></li>
      </ul>
    </div>

    <!-- Cities (nombres propios) -->
    <div>
      <h4>{$i18n['footer.cities']}</h4>
      <ul>
        <li><a href="/events?city=Barcelona">Barcelona</a></li>
        <li><a href="/events?city=Madrid">Madrid</a></li>
        <li><a href="/events?city=Valencia">Valencia</a></li>
        <li><a href="/events?city=Yerevan">Yerevan</a></li>
      </ul>
    </div>

    <!-- Language quick switch -->
    <div>
      <h4>{$i18n['footer.language']}</h4>
      <ul>
        <li><a href="?lang=en" on:click|preventDefault={() => setLang('en')}>English</a></li>
        <li><a href="?lang=es" on:click|preventDefault={() => setLang('es')}>Español</a></li>
        <li><a href="?lang=ru" on:click|preventDefault={() => setLang('ru')}>Русский</a></li>
        <li><a href="?lang=hy" on:click|preventDefault={() => setLang('hy')}>Հայերեն</a></li>
      </ul>
    </div>
  </div>

  <div class="container footer-bottom">
    <div>© {new Date().getFullYear()} SkyArmenia — {$i18n['footer.rights']}</div>
    <div class="policy">
      <a href="/privacy">{$i18n['footer.privacy']}</a>
      <a href="/terms">{$i18n['footer.terms']}</a>
      <a href="/cookies">{$i18n['footer.cookies']}</a>
    </div>
  </div>
</footer>

