<!-- src/lib/components/Footer.svelte -->
<script lang="ts">
  import { i18n, lang, type Lang } from '$lib/i18n';

  // Idioma actual (para preservar ?lang= en enlaces internos)
  let current: Lang = 'es';
  $: current = $lang;

  // Helper para construir href con ?lang= y otros params opcionales
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

    <!-- Social (en lugar de idiomas) -->
    <div>
      <h4>Social</h4>
      <div class="social" aria-label="Social links">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="fb">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 12.07C22 6.49 17.52 2 12 2S2 6.49 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.03H8v-2.9h2.44V9.41c0-2.42 1.43-3.77 3.63-3.77 1.05 0 2.15.18 2.15.18v2.37h-1.21c-1.2 0-1.57.75-1.57 1.52v1.82H16l-.39 2.9h-2.6v7.03c4.78-.8 8.44-4.94 8.44-9.93Z"/>
          </svg>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="ig">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7Zm10 2c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3h10Zm-5 3.5A5.5 5.5 0 1 0 17.5 13 5.51 5.51 0 0 0 12 7.5Zm0 2A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5Zm4.75-2.88a1.13 1.13 0 1 0 1.13 1.13 1.13 1.13 0 0 0-1.13-1.13Z"/>
          </svg>
        </a>
        <a href="mailto:info@skyarmenia.com" aria-label="Email" class="mail">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
  .footer {
    margin-top: 40px;
    background: #fafafa;
    border-top: 1px solid var(--border);
    color: #111;
  }
  .footer-top {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr; /* 4 columnas: Brand, Links, Cities, Social */
    gap: 24px;
    padding: 32px 0;
  }
  .footer .brand-row {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .footer .brand-logo {
    height: 140px;
    width: auto;
    display: block;
  }

  .footer h4 {
    margin: 0 0 10px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: #222;
  }
  .footer ul { list-style: none; margin: 0; padding: 0; }
  .footer li + li { margin-top: 8px; }
  .footer a { color: inherit; text-decoration: none; }
  .footer a:hover { text-decoration: underline; }

  .social {
    margin-top: 6px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .social a {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: transform .2s ease, opacity .2s ease;
  }
  .social a:hover { transform: translateY(-2px); opacity: 0.9; }
  .social a.fb { background: #1877f2; }
  .social a.ig { background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%); }
  .social a.mail { background: #ea4335; }

  .footer-bottom {
    border-top: 1px solid var(--border);
    padding: 12px 0;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; font-size: 13px; color: #555;
  }
  .policy { display: flex; gap: 14px; flex-wrap: wrap; }
  .policy a { color: inherit; text-decoration: none; }
  .policy a:hover { text-decoration: underline; }

  /* Responsive */
  @media (max-width: 900px) {
    .footer-top { grid-template-columns: 1.6fr 1fr 1fr; } /* 3 columnas: Brand + 2 */
  }
  @media (max-width: 760px) {
    .footer-top { grid-template-columns: 1fr 1fr; gap: 18px; text-align: center; }
    .footer .brand-logo { height: 120px; }
  }
  @media (max-width: 560px) {
    .footer-top { grid-template-columns: 1fr; padding: 24px 0; text-align: center; }
    .footer-bottom { flex-direction: column; align-items: center; gap: 8px; text-align: center; }
    .footer .brand-logo { height: 100px; }
    .social a { width: 28px; height: 28px; }
  }
</style>
