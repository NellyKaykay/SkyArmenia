<script lang="ts">
  import { i18n, lang, type Lang } from '$lib/i18n';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let current: Lang = 'es';
  $: current = $lang;

  $: pathname = $page?.url?.pathname || '';
  $: isAuth = pathname.startsWith('/login') || pathname.startsWith('/signup');

  function href(path: string, params: Record<string, string> = {}) {
    const sp = new URLSearchParams(params);
    sp.set('lang', current);
    const qs = sp.toString();
    return qs ? `${path}?${qs}` : path;
  }

  /* Map */
  const LAT = 41.3929;
  const LON = 2.1542;
  let mapEl: HTMLDivElement | null = null;

  onMount(async () => {
    const L = (await import('leaflet')) as typeof import('leaflet');
    // @ts-ignore
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    if (!mapEl) return;
    const map = L.map(mapEl, {
      center: [LAT, LON],
      zoom: 16,
      scrollWheelZoom: !isAuth,
      touchZoom: !isAuth,
      keyboard: !isAuth,
      dragging: true,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([LAT, LON])
      .addTo(map)
      .bindPopup('<strong>Carrer de Còrsega, 203</strong><br/>08036 Barcelona')
      .openPopup();

    setTimeout(() => map.invalidateSize(), 200);
  });
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />
</svelte:head>

<footer class="ftr">
  <!-- TOP -->
  <div class="wrap top">
    <div class="brand">
      <img src="/logo-skyarmenia.svg" alt="SkyArmenia" />
    </div>

    <div class="col">
      <h4>{$i18n['footer.links']}</h4>
      <ul>
        <li><a href={href('/about')}>{$i18n['nav.about']}</a></li>
        <li><a href={href('/events')}>{$i18n['nav.events']}</a></li>
        <li><a href={`${href('/') }#searchbar`}>{$i18n['nav.flights']}</a></li>
      </ul>
    </div>

    <div class="col">
      <h4>{$i18n['footer.cities']}</h4>
      <ul>
        <li><a href="https://share.google/NhvfbVIC9fuoQJOB9" target="_blank">{$i18n['offers.yerevan']}</a></li>
        <li><a href="https://share.google/oVA2anBjkd4xetgMf" target="_blank">{$i18n['offers.barcelona']}</a></li>
      </ul>
    </div>

    <div class="col">
      <h4>{$i18n['footer.social']}</h4>
      <div class="social">
        <a class="icon fb" href="https://facebook.com" target="_blank" aria-label="Facebook">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22 12.07C22 6.49 17.52 2 12 2S2 6.49 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.03H8v-2.9h2.44V9.41c0-2.42 1.43-3.77 3.63-3.77 1.05 0 2.15.18 2.15.18v2.37h-1.21c-1.2 0-1.57.75-1.57 1.52v1.82H16l-.39 2.9h-2.6v7.03c4.78-.8 8.44-4.94 8.44-9.93Z"/></svg>
        </a>
        <a class="icon ig" href="https://instagram.com" target="_blank" aria-label="Instagram">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7Zm10 2c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3h10Zm-5 3.5A5.5 5.5 0 1 0 17.5 13 5.51 5.51 0 0 0 12 7.5Zm0 2A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5Zm4.75-2.88a1 1 0 1 0 1 1 1 1 0 0 0-1-1Z"/></svg>
        </a>
      </div>
    </div>
  </div>

  <!-- CONTACT -->
  <div class="wrap contact">
    <div class="col">
      <h4>{$i18n['nav.contact']}</h4>
      <ul>
        <li>
          <a href="tel:+34644393949" class="contact-link">
            <span class="icon phone">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a2 2 0 0 1-2 2C10.4 22 2 13.6 2 3a2 2 0 0 1 2-2h3.49a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2Z"/>
              </svg>
            </span>
            Móvil: +34 644 39 39 49
          </a>
        </li>
        <li>
          <a href="mailto:info@skyarmenia.com" class="contact-link">
            <span class="icon mail">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/>
              </svg>
            </span>
            info@skyarmenia.com
          </a>
        </li>
        <li>
          <a href="https://www.google.com/maps?q=Carrer+de+C%C3%B2rsega+203,+08036+Barcelona&hl=es" target="_blank" rel="noopener noreferrer" class="contact-link">
            <span class="icon location">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5Z"/>
              </svg>
            </span>
            C/Còrsega, 203, Entlo. C<br>08036 Barcelona
          </a>
        </li>
      </ul>
    </div>

    <!-- Mapa -->
    <div class="map">
      <div class="map-inner" bind:this={mapEl} role="region" aria-label="Mapa"></div>
    </div>
  </div>

  <!-- BOTTOM -->
  <div class="wrap bottom">
    <div class="copy">© {new Date().getFullYear()} SkyArmenia — {$i18n['footer.rights']}</div>
    <div class="policy">
      <a href={href('/privacy')}>{$i18n['footer.privacy']}</a>
      <a href={href('/terms')}>{$i18n['footer.terms']}</a>
      <a href={href('/cookies')}>{$i18n['footer.cookies']}</a>
    </div>
  </div>
</footer>

<style>
  :global(:root){
    --border: rgba(0,0,0,.07);
    --muted: #6b7280;
    --ink: #1f2937;
    --radius: 16px;
  }

  .ftr{
    background: #fff;
    border-top: 1px solid var(--border);
    color: var(--ink);
    margin-top: clamp(20px, 4vw, 36px);
  }
  .wrap{
    max-width: 1200px;
    margin: 0 auto;
    padding-inline: clamp(16px, 4vw, 24px);
  }

  /* === TOP === */
  .top{
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: clamp(16px, 2.5vw, 28px);
    padding: clamp(20px, 4vw, 32px) 0;
    align-items: start;
  }
  .brand img{ height: clamp(90px, 14vw, 140px); width: auto; display: block; }

  h4{
    margin: 0 0 10px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: #222;
  }
  ul{ margin: 0; padding: 0; list-style: none; }
  li+li{ margin-top: 8px; }
  a{ color: var(--ink); text-decoration: none; }
  a:hover{ text-decoration: underline; }

  .social{
    margin-top: 8px;
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .icon{
    width: 36px; height: 36px; border-radius: 999px;
    display: inline-flex; align-items: center; justify-content: center;
    border: 1px solid rgba(0,0,0,.08); background:#fff;
    transition: transform .08s ease, box-shadow .15s ease;
  }
  .icon:hover{
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(0,0,0,.12);
  }
  .icon.fb{ color:#1877f2; border-color: rgba(24,119,242,.25); }
  .icon.ig{ color:#d6249f; border-color: rgba(214,36,159,.25); }
  .icon.phone{ color:#10b981; border-color: rgba(16,185,129,.25); }
  .icon.mail{ color:#ea4335; border-color: rgba(234,67,53,.25); }
  .icon.location{ color:#2563eb; border-color: rgba(37,99,235,.25); }

  /* Enlaces de contacto con iconos */
  .contact-link{
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* === CONTACT === */
  .contact{
    border-top: 1px solid var(--border);
    padding: clamp(20px, 4vw, 32px) 0;
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: clamp(16px, 2.5vw, 28px);
    align-items: start;
  }
  .contact{
    display: grid;
    grid-template-columns: minmax(0,1fr) minmax(0,2fr); /* contacto | mapa */
    gap: clamp(16px, 3vw, 28px);
    align-items: center;
  }






  /* Mapa */
  .map{ width: 100%; }
  .map-inner{
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 45%;
    min-height: 220px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,.08);
    box-shadow: 0 6px 20px rgba(0,0,0,.08);
  }
  .map-inner :global(.leaflet-container){
    position: absolute; inset: 0; width: 100%; height: 100%;
  }

  /* === BOTTOM === */
  .bottom{
    border-top: 1px solid var(--border);
    padding: clamp(10px, 2vw, 14px) 0;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap; font-size: 13px; color:#555;
  }
  .policy{ display: flex; gap: 14px; flex-wrap: wrap; }
  .policy a{ color: inherit; }

  /* === RESPONSIVE === */
  @media (max-width: 900px){
    .top{ grid-template-columns: 1.2fr 1fr 1fr; }
    .contact{ grid-template-columns: 1fr; } /* mapa debajo */
  }
  @media (max-width: 760px){
    .top{ grid-template-columns: 1fr 1fr; gap: 18px; text-align: center; justify-items: center; }
    .brand img{ height: 100px; }
    .contact{ text-align: center; justify-items: center; }
    .social{ justify-content: center; }
  }
  @media (max-width: 560px){
    .top{ grid-template-columns: 1fr; text-align: center; justify-items: center; }
    .contact{ text-align: center; justify-items: center; }
    .social{ justify-content: center; }
    .bottom{ justify-content: center; text-align: center; }
  }
</style>
