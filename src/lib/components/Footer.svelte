<script lang="ts">
  import { i18n, lang, type Lang } from '$lib/i18n';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

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

  // Coordenadas aproximadas de Carrer de Còrsega 203, Barcelona
  const LAT = 41.3929;
  const LON = 2.1542;
  let mapContainer: HTMLDivElement | null = null;

  onMount(async () => {
    // Carga Leaflet como namespace (compatible con @types/leaflet)
    const L = (await import('leaflet')) as typeof import('leaflet');

    // Arreglo de iconos por bundlers
    // @ts-ignore
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    if (mapContainer) {
      const map = L.map(mapContainer, {
        center: [LAT, LON],
        zoom: 16,
        // En auth bloqueamos interacciones que “roban” scroll; fuera de auth, normal
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

      // Recalcula si cambia el tamaño del contenedor
      setTimeout(() => map.invalidateSize(), 300);
    }
  });
</script>

<svelte:head>
  <!-- CSS de Leaflet por CDN para evitar errores de loader -->
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />
</svelte:head>

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

    <!-- antes: href('/flights') -->
    <!-- ahora: a la home + ancla del buscador -->
    <li><a href={`${href('/') }#searchbar`}>{$i18n['nav.flights']}</a></li>
  </ul>
</div>


   <!-- Cities -->
<div>
  <h4>{$i18n['footer.cities']}</h4>
  <ul>
    <li>
      <a
        href="https://share.google/NhvfbVIC9fuoQJOB9"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="{$i18n['offers.yerevan']}"
      >
        {$i18n['offers.yerevan']}
      </a>
    </li>
    <li>
      <a
        href="https://share.google/oVA2anBjkd4xetgMf"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="{$i18n['offers.barcelona']}"
      >
        {$i18n['offers.barcelona']}
      </a>
    </li>
  </ul>
</div>

    <!-- Social -->
    
    <div>
      <h4>{$i18n['footer.social']}</h4>
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
      </div>
    </div>
  </div>

  <!-- Contact band (sticky solo en login/signup) -->
  <div class="contact-band" class:sticky={isAuth}>
    <div class="container contact-grid">
      <!-- Datos de contacto -->
      <div class="contact-info">
        <h4>{$i18n['nav.contact']}</h4>
         <a
            href="https://www.google.com/maps?q=Carrer+de+C%C3%B2rsega+203,+08036+Barcelona&hl=es"
            target="_blank" rel="noopener noreferrer" class="email-link" aria-label="Ver en Google Maps"
          >
            <span class="icon-btn location" aria-hidden="true">
              <!-- Location / Pin SVG -->
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5Z"/>
              </svg>
            </span>
            <span>Carrer de Còrsega, 203, Entresuelo C<br>
              
          08036 Barcelona</span>
          </a>
        

        <div class="contact-links">
          <!-- TELÉFONO con icono redondo y color -->
          <a href="tel:+34644393949" aria-label="Llamar por teléfono" class="email-link">
            <span class="icon-btn phone" aria-hidden="true">
              <!-- Phone SVG -->
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a2 2 0 0 1-2 2C10.4 22 2 13.6 2 3a2 2 0 0 1 2-2h3.49a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2Z"/>
              </svg>
            </span>
            <span>Móvil: +34 644 39 39 49</span>
          </a>

          <!-- EMAIL con icono tipo botón redondo (como Facebook/Instagram) -->
          <a href="mailto:info@skyarmenia.com" aria-label="Email" class="email-link">
            <span class="icon-btn mail" aria-hidden="true">
              <!-- Mail SVG -->
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/>
              </svg>
            </span>
            <span>info@skyarmenia.com</span>
          </a>

          <!-- DIRECCIÓN / MAPS con icono redondo y color -->
         
        </div>
      </div>

      <!-- Mapa interactivo (Leaflet + OSM) -->
      <div class="contact-map">
        <div class="map-embed" role="region" aria-label="Mapa de la dirección" bind:this={mapContainer}></div>
      </div>
    </div>
  </div>

  <div class="container footer-bottom">
    <div class="footer-copy">© {new Date().getFullYear()} SkyArmenia — {$i18n['footer.rights']}</div>
    <div class="policy">
      <a href={href('/privacy')}>{$i18n['footer.privacy']}</a>
      <a href={href('/terms')}>{$i18n['footer.terms']}</a>
      <a href={href('/cookies')}>{$i18n['footer.cookies']}</a>
    </div>
  </div>
</footer>

<style>
  /* Contenedor global del footer */
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

  /* TOP */
  .footer-top {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: clamp(16px, 2.5vw, 28px);
    padding: clamp(20px, 4vw, 32px) 0;
    align-items: start;
  }

  .brand-row { display: flex; align-items: center; justify-content: flex-start; }
  .brand-logo { height: clamp(90px, 14vw, 140px); width: auto; display: block; }

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

  /* Social */
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
  /* Email (ya estaba) */
  .icon-btn.mail { color: #ea4335; border-color: rgba(234,67,53,.25); }
  /* Nuevos colores para contacto (mismo estilo que email) */
  .icon-btn.phone    { color: #10b981; border-color: rgba(16,185,129,.25); }  /* verde */
  .icon-btn.location { color: #2563eb; border-color: rgba(37,99,235,.25); }   /* azul */

  /* --- Contact band --- */
  .contact-band {
    border-top: 1px solid var(--border);
    background: #fff;
    padding: clamp(14px, 3vw, 120px) 0;
  }
  .contact-band.sticky {
    position: sticky;
    bottom: 0;
    z-index: 5;
    box-shadow: 0 -10px 24px rgba(0,0,0,.08);
    backdrop-filter: blur(6px);
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 2fr; /* info | mapa */
    gap: clamp(16px, 3vw, 28px);
    align-items: stretch;
  }

  .contact-info h4 {
    margin: 0 0 30px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: #222;
   
  }

  
 

  .contact-links {
    display: flex;
    flex-direction: column;
   
  }

  

  .contact-links a {
    color: #1f2937;
    text-decoration: none;
  }
  .contact-links a:hover { text-decoration: underline; }
  .contact-links a:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(56,182,255,.35), 0 0 0 6px rgba(56,182,255,.2);
    border-radius: 6px;
  }

  .email-link {
    display: flex;
    align-items: center;
    gap: clamp(14px, 3vw, 28px);
    padding: clamp(14px, 3vw, 20px) 0;
  }


  /* asegura que el botón redondo no se deforma junto al texto */
  .email-link .icon-btn { flex-shrink: 0; }

  /* Mapa responsivo (altura cómoda para sticky) */
  .map-embed {
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
  .map-embed :global(.leaflet-container) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  /* --- BOTTOM (legal) --- */
  .footer-bottom {
    border-top: 1px solid var(--border);
    padding: clamp(10px, 2vw, 14px) 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: #555;
    flex-wrap: wrap;
  }
  .policy { display: flex; gap: 14px; flex-wrap: wrap; }
  .policy a { color: inherit; }
  .policy a:hover { text-decoration: underline; }


  :global(html) { scroll-behavior: smooth; }


  /* Breakpoints */
  @media (max-width: 900px) {
    .footer-top { grid-template-columns: 1.2fr 1fr 1fr; }
    .contact-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 760px) {
    .footer-top {
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    .brand-row { justify-content: center; }
    .footer h4 { text-align: center; }

    /* Centrado de contacto en responsive */
    .contact-info { text-align: center; }
    .contact-links { align-items: center; }
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

    /* Centra los textos de abajo del footer en móvil */
    .footer-bottom {
      justify-content: center;
      text-align: center;
      gap: 8px;
    }
    .footer-copy, .policy {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
</style>
