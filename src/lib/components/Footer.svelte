<!-- src/lib/components/Footer.svelte -->
<script lang="ts">
  import { i18n, lang, type Lang } from '$lib/i18n';

  // Idioma actual (para preservar ?lang= en enlaces internos)
  let current: Lang = 'es';
  $: current = $lang;

  function href(path: string, params: Record<string, string> = {}) {
    const sp = new URLSearchParams(params);
    sp.set('lang', current);
    const qs = sp.toString();
    return qs ? `${path}?${qs}` : path;
  }
</script>

<footer class="footer">
  <div class="container footer-top">
    <!-- Brand -->
    <div>
      <div class="brand-row">
        <img src="/logo-skyarmenia.svg" alt="SkyArmenia" class="brand-logo" />
      </div>
    </div>

    <!-- Links -->
    <div>
      <h4>{$i18n['footer.links']}</h4>
      <ul>
        <li><a href={href('/about')}>{$i18n['nav.about']}</a></li>
        <li><a href={href('/events')}>{$i18n['nav.events']}</a></li>
        <li><a href={href('/flights')}>{$i18n['nav.flights']}</a></li>
        <li><a href={href('/contact')}>{$i18n['nav.contact']}</a></li>
      </ul>
    </div>

    <!-- Cities -->
    <div>
      <h4>{$i18n['footer.cities']}</h4>
      <ul>
        <li><a href={href('/events', { city: 'Barcelona' })}>Barcelona</a></li>
        <li><a href={href('/events', { city: 'Madrid' })}>Madrid</a></li>
        <li><a href={href('/events', { city: 'Valencia' })}>Valencia</a></li>
        <li><a href={href('/events', { city: 'Yerevan' })}>Yerevan</a></li>
      </ul>
    </div>

    <!-- Social -->
    <div>
      <h4>Social</h4>
      <div class="social" aria-label="Social links">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="icon-btn fb">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 12.07C22 6.49 17.52 2 12 2S2 6.49 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.03H8v-2.9h2.44V9.41c0-2.42 1.43-3.77 3.63-3.77 1.05 0 2.15.18 2.15.18v2.37h-1.21c-1.2 0-1.57.75-1.57 1.52v1.82H16l-.39 2.9h-2.6v7.03c4.78-.8 8.44-4.94 8.44-9.93Z"/>
          </svg>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="icon-btn ig">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7Zm10 2c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3h10Zm-5 3.5A5.5 5.5 0 1 0 17.5 13 5.51 5.51 0 0 0 12 7.5Zm0 2A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5Zm4.75-2.88a1 1 0 1 0 1 1 1 1 0 0 0-1-1Z"/>
          </svg>
        </a>
        <a href="mailto:info@skyarmenia.com" aria-label="Email" class="icon-btn mail">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/>
          </svg>
        </a>
      </div>
    </div>
  </div>

  <div class="container footer-bottom">
    <div>© {new Date().getFullYear()} SkyArmenia — {$i18n['footer.rights']}</div>
    <div class="policy">
      <a href={href('/privacy')}>{$i18n['footer.privacy']}</a>
      <a href={href('/terms')}>{$i18n['footer.terms']}</a>
      <a href={href('/cookies')}>{$i18n['footer.cookies']}</a>
    </div>
  </div>
</footer>

<style>
  /* Contenedor global del footer (por si .container no tiene estilos globales) */
  .footer .container {
    max-width: 1200px;
    margin-inline: auto;
    padding-inline: clamp(16px, 4vw, 24px);
  }

  .footer {
    margin-top: clamp(20px, 4vw, 36px);
    background: #ffffff;
    border-top: 1px solid var(--border);
    color: #111;
  }

  /* TOP: grid 1→2→4 columnas */
  .footer-top {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr; /* desktop */
    gap: clamp(16px, 2.5vw, 28px);
    padding: clamp(20px, 4vw, 32px) 0;
    align-items: start;
  }

  /* Brand: izquierda en desktop, centrado en móvil */
  .brand-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;     /* desktop: izq */
  }
  .brand-logo {
    height: clamp(90px, 14vw, 140px);
    width: auto;
    display: block;
  }

  /* Títulos y enlaces */
  .footer h4 {
    margin: 0 0 10px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: #222;
    text-align: left;
  }
  .footer ul { list-style: none; margin: 0; padding: 0; }
  .footer li + li { margin-top: 8px; }

  .footer a {
    color: #1f2937;
    text-decoration: none;
    text-underline-offset: 2px;
  }
  .footer a:hover { text-decoration: underline; }
  .footer a:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(56,182,255,.35), 0 0 0 6px rgba(56,182,255,.2);
    border-radius: 6px;
  }

  /* Social: botones accesibles */
  .social {
    margin-top: 8px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    width: 100%;
  }
  .icon-btn {
    width: 36px; height: 36px;
    border-radius: 999px;
    display: inline-flex; align-items: center; justify-content: center;
    border: 1px solid rgba(0,0,0,.08);
    background: #fff;
    color: #1f2937;
    transition: transform .08s ease, box-shadow .15s ease, background .2s;
  }
  .icon-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(0,0,0,.12);
  }
  .icon-btn.fb { color: #1877f2; border-color: rgba(24,119,242,.25); }
  .icon-btn.ig { color: #d6249f; border-color: rgba(214,36,159,.25); }
  .icon-btn.mail { color: #ea4335; border-color: rgba(234,67,53,.25); }

  /* BOTTOM (legal) */
  .footer-bottom {
    border-top: 1px solid var(--border);
    padding: clamp(10px, 2vw, 14px) 0;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; font-size: 13px; color: #555;
    flex-wrap: wrap;
  }
  .policy { display: flex; gap: 14px; flex-wrap: wrap; }
  .policy a { color: inherit; }
  .policy a:hover { text-decoration: underline; }

  /* Breakpoints */
  @media (max-width: 900px) {
    .footer-top { grid-template-columns: 1.2fr 1fr 1fr; } /* Social cae abajo */
  }
  @media (max-width: 760px) {
    .footer-top {
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    .brand-row { justify-content: center; }          /* móvil: centro */
    .footer h4 { text-align: center; }
  }
  @media (max-width: 560px) {
    .footer-top {
      grid-template-columns: 1fr;
      padding: 20px 0;
      text-align: center;
      justify-items: center;
    }
    .social { justify-content: center; }
    .brand-logo { height: 100px; }
  }
</style>
