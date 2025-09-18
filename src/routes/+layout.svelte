<script lang="ts"> 
  import '../app.css';
  import Header from '$lib/components/Header.svelte';

  // Footer usa $i18n y setLang para los enlaces de idioma
  import { i18n, setLang } from '$lib/i18n';

  // ⬇️ Recibe la sesión desde +layout.server.ts
  export let data: { session: any };
</script>

<style>
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

  .footer-bottom {
    border-top: 1px solid var(--border);
    padding: 12px 0;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; font-size: 13px; color: #555;
  }
  .policy { display: flex; gap: 14px; }
  .policy a { color: inherit; text-decoration: none; }
  .policy a:hover { text-decoration: underline; }

  /* ---------- Responsive (footer) ---------- */
  @media (max-width: 900px) {
    .footer-top { grid-template-columns: 1.6fr 1fr 1fr; }
  }
  @media (max-width: 600px) {
    /* (Nota) estilos del header están dentro del componente */
    .page { padding-top: 0; }
    .footer-top { grid-template-columns: 1fr; padding: 24px 0; }
    .footer-bottom { flex-direction: column; align-items: flex-start; gap: 8px; }
  }
</style>

<!-- Header (componente) -->
<Header session={data?.session} />

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
        <img src="/logo-skyarmenia.svg" alt="SkyArmenia" class="brand-logo" />
      </div>
      <div class="social" aria-label="Social links">
        <!-- (opcional) añade iconos/enlaces reales cuando quieras -->
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

    <!-- Cities -->
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
