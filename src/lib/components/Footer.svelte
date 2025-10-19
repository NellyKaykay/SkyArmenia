<script lang="ts">
  import { i18n, lang, type Lang } from '$lib/i18n';
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import type { Map as LeafletMap, Marker } from 'leaflet';

  // Types and interfaces
  interface ContactLink {
    href: string;
    icon: string;
    text: string;
    external?: boolean;
  }

  interface SocialLink {
    href: string;
    icon: string;
    label: string;
    color: string;
  }

  // State management
  let current: Lang = 'es';
  let mapInstance: LeafletMap | null = null;
  let mapMarker: Marker | null = null;
  let mapEl: HTMLDivElement | null = null;
  let isMapLoaded = false;

  // Reactive declarations
  $: current = $lang;
  $: pathname = $page?.url?.pathname || '';
  $: isAuth = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // Constants
  const COMPANY_COORDS = {
    LAT: 41.3929,
    LON: 2.1542,
    ADDRESS: 'Carrer de Còrsega, 203, Entlo. C<br>08036 Barcelona'
  } as const;

  const CONTACT_INFO: ContactLink[] = [
    {
      href: 'tel:+34644393949',
      icon: 'phone',
      text: 'Móvil: +34 644 39 39 49'
    },
    {
      href: 'mailto:info@skyarmenia.com',
      icon: 'mail',
      text: 'info@skyarmenia.com'
    },
    {
      href: 'https://www.google.com/maps?q=Carrer+de+C%C3%B2rsega+203,+08036+Barcelona&hl=es',
      icon: 'location',
      text: COMPANY_COORDS.ADDRESS,
      external: true
    }
  ];

  const SOCIAL_LINKS: SocialLink[] = [
    {
      href: 'https://facebook.com/skyarmenia',
      icon: 'facebook',
      label: 'Facebook',
      color: '#1877f2'
    },
    {
      href: 'https://instagram.com/skyarmenia',
      icon: 'instagram', 
      label: 'Instagram',
      color: '#d6249f'
    }
  ];

  // Helper functions
  function href(path: string, params: Record<string, string> = {}): string {
    const searchParams = new URLSearchParams(params);
    searchParams.set('lang', current);
    const queryString = searchParams.toString();
    return queryString ? `${path}?${queryString}` : path;
  }

    // Map initialization with proper error handling
  async function initializeMap(): Promise<void> {
    if (typeof window === 'undefined' || !mapEl || isMapLoaded) return;

    try {
      const L = await import('leaflet');
      
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });

      mapInstance = L.map(mapEl, {
        center: [COMPANY_COORDS.LAT, COMPANY_COORDS.LON],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        touchZoom: true
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
      }).addTo(mapInstance);

      mapMarker = L.marker([COMPANY_COORDS.LAT, COMPANY_COORDS.LON])
        .addTo(mapInstance)
        .bindPopup(`
          <div class="map-popup">
            <strong>SkyArmenia</strong><br>
            <small>${COMPANY_COORDS.ADDRESS}</small>
          </div>
        `)
        .openPopup();

      isMapLoaded = true;
    } catch (error) {
      console.error('Error loading map:', error);
      if (mapEl) {
        mapEl.innerHTML = '<div class="map-error">Error al cargar el mapa</div>';
      }
    }
  }

  // Cleanup function
  function cleanupMap(): void {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
    if (mapMarker) {
      mapMarker = null;
    }
    isMapLoaded = false;
  }

  onMount(initializeMap);
  onDestroy(cleanupMap);
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />
</svelte:head>

{#if !isAuth}
<footer class="ftr" aria-label="Información de contacto y enlaces">
  <!-- Navigation and Brand Section -->
  <div class="wrap top">
    <div class="brand">
      <img src="/logo-skyarmenia.svg" alt="SkyArmenia - Agencia de Viajes" />
    </div>

    <nav class="col" aria-labelledby="footer-links-heading">
      <h4 id="footer-links-heading">{$i18n['footer.links']}</h4>
      <ul role="list">
        <li role="listitem"><a href={href('/about')}>{$i18n['nav.about']}</a></li>
        <li role="listitem"><a href={href('/events')}>{$i18n['nav.events']}</a></li>
        <li role="listitem"><a href={`${href('/') }#searchbar`}>{$i18n['nav.flights']}</a></li>
      </ul>
    </nav>

    <nav class="col" aria-labelledby="footer-cities-heading">
      <h4 id="footer-cities-heading">{$i18n['footer.cities']}</h4>
      <ul role="list">
        <li role="listitem">
          <a 
            class="city-link"
            href="https://share.google/NhvfbVIC9fuoQJOB9"
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Ver ofertas para Yerevan (se abre en nueva ventana)"
          >
            <span class="icon location" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5Z"/>
              </svg>
            </span>
            <span class="city-text">{$i18n['offers.yerevan']}</span>
          </a>
        </li>
        <li role="listitem">
          <a 
            class="city-link"
            href="https://share.google/oVA2anBjkd4xetgMf"
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Ver ofertas para Barcelona (se abre en nueva ventana)"
          >
            <span class="icon location" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5Z"/>
              </svg>
            </span>  
            <span class="city-text">{$i18n['offers.barcelona']}</span>
          </a>
        </li>
      </ul>
    </nav>

    <section class="col" aria-labelledby="footer-social-heading">
      <h4 id="footer-social-heading">{$i18n['footer.social']}</h4>
      <div class="social" role="list">
        {#each SOCIAL_LINKS as social}
          <a 
            class="icon {social.icon === 'facebook' ? 'fb' : 'ig'}"
            href={social.href}
            target="_blank" 
            rel="noopener noreferrer"
            aria-label={`Visitar ${social.label} de SkyArmenia (se abre en nueva ventana)`}
            style="--social-hover: {social.color}"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              {#if social.icon === 'facebook'}
                <path d="M22 12.07C22 6.49 17.52 2 12 2S2 6.49 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.03H8v-2.9h2.44V9.41c0-2.42 1.43-3.77 3.63-3.77 1.05 0 2.15.18 2.15.18v2.37h-1.21c-1.2 0-1.57.75-1.57 1.52v1.82H16l-.39 2.9h-2.6v7.03c4.78-.8 8.44-4.94 8.44-9.93Z"/>
              {:else}
                <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7Zm10 2c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3h10Zm-5 3.5A5.5 5.5 0 1 0 17.5 13 5.51 5.51 0 0 0 12 7.5Zm0 2A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5Zm4.75-2.88a1 1 0 1 0 1 1 1 1 0 0 0-1-1Z"/>
              {/if}
            </svg>
          </a>
        {/each}
      </div>
    </section>
  </div>

  <!-- Contact Information and Map -->
  <div class="wrap contact">
    <section class="col" aria-labelledby="contact-heading">
      <h4 id="contact-heading">{$i18n['nav.contact']}</h4>
      <ul role="list">
        {#each CONTACT_INFO as contact}
          <li role="listitem">
            <a 
              href={contact.href}
              class="contact-link"
              {...(contact.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              aria-label={`Contactar por ${contact.icon === 'phone' ? 'teléfono' : contact.icon === 'mail' ? 'email' : 'ubicación'}${contact.external ? ' (se abre en nueva ventana)' : ''}`}
            >
              <span class="icon {contact.icon}" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  {#if contact.icon === 'phone'}
                    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a2 2 0 0 1-2 2C10.4 22 2 13.6 2 3a2 2 0 0 1 2-2h3.49a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2Z"/>
                  {:else if contact.icon === 'mail'}
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/>
                  {:else if contact.icon === 'location'}
                    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5Z"/>
                  {/if}
                </svg>
              </span>
              <span class="contact-text">{@html contact.text}</span>
            </a>
          </li>
        {/each}
      </ul>
    </section>

    <!-- Interactive Map -->
    <div class="map">
      <div 
        class="map-inner" 
        bind:this={mapEl}
        role="img"
        aria-label="Mapa interactivo mostrando la ubicación de SkyArmenia en Barcelona"
      >
        {#if !isMapLoaded}
          <div class="map-loading" aria-live="polite">Cargando mapa...</div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Copyright and Legal Links -->
  <div class="wrap bottom">
    <div class="copy" role="complementary" aria-label="Información de derechos de autor">
      © {new Date().getFullYear()} SkyArmenia — {$i18n['footer.rights']}
    </div>
    <nav class="policy" aria-label="Enlaces de políticas legales">
      <a href={href('/privacy')} aria-label="Leer política de privacidad">
        {$i18n['footer.privacy']}
      </a>
      <a href={href('/terms')} aria-label="Leer términos y condiciones">
        {$i18n['footer.terms']}
      </a>
      <a href={href('/cookies')} aria-label="Leer política de cookies">
        {$i18n['footer.cookies']}
      </a>
    </nav>
  </div>
</footer>
{/if}

<style>
  :global(:root) {
    --footer-bg: #f8fafc;
    --footer-border: rgba(0, 0, 0, 0.08);
    --footer-text: #64748b;
    --footer-heading: #0f172a;
    --footer-link: #475569;
    --footer-link-hover: #10b981;
    --footer-radius: 12px;
    --footer-spacing: 1.5rem;
    --footer-transition: all 0.2s ease;
  }

  .ftr {
    background: var(--footer-bg);
    border-top: 1px solid var(--footer-border);
    color: var(--footer-text);
    margin-top: clamp(2rem, 4vw, 3rem);
  }

  .wrap {
    max-width: 1200px;
    margin: 0 auto;
    padding-inline: clamp(1rem, 4vw, 1.5rem);
  }

  /* Navigation and Brand Section */
  .top {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: clamp(1rem, 2.5vw, 1.75rem);
    padding: clamp(1.5rem, 4vw, 2rem) 0;
    align-items: start;
  }

  .brand img {
    height: clamp(90px, 14vw, 140px);
    width: auto;
    display: block;
  }

  h4 {
    margin: 0 0 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--footer-heading);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li + li {
    margin-top: 0.5rem;
  }

  /* Consistent alignment for all list items */
  li {
    display: flex;
    align-items: flex-start;
  }

  li a {
    width: 100%;
  }

  /* Base link styles */
  a {
    color: var(--footer-link);
    text-decoration: none;
    transition: var(--footer-transition);
    display: inline-block;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  /* Simple text links (navigation) */
  .col ul a:hover,
  .col ul a:focus {
    color: var(--footer-link-hover);
    text-decoration: none;
    transform: translateX(2px);
  }

  .social {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  /* All Icons - Simple, no backgrounds or borders */
  .icon {
    width: 1.5rem;
    height: 1.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: var(--footer-transition);
  }

  .icon:hover,
  .icon:focus {
    transform: scale(1.1);
  }

  /* Icon Colors - Simple and consistent */
  .icon.fb {
    color: #1877f2;
  }

  .icon.ig {
    color: #d6249f;
  }

  .icon.phone {
    color: #10b981;
  }

  .icon.mail {
    color: #ea4335;
  }

  .icon.location {
    color: #2563eb;
  }

  /* Interactive Map */
  .map {
    width: 100%;
  }

  .map-inner {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 45%;
    min-height: 240px;
    border-radius: var(--footer-radius);
    overflow: hidden;
    border: 1px solid var(--footer-border);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
    transition: var(--footer-transition);
  }

  .map-inner:hover,
  .map-inner:focus-within {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border-color: var(--footer-link-hover);
  }

  .map-inner :global(.leaflet-container) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .map-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--footer-bg);
    color: var(--footer-text);
    font-size: 0.875rem;
  }

  .map-error {
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    border-radius: var(--footer-radius);
    text-align: center;
    font-size: 0.875rem;
  }

  :global(.map-popup) {
    text-align: center;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  :global(.map-popup strong) {
    color: var(--footer-heading);
    font-weight: 600;
  }

  :global(.map-popup em) {
    color: var(--footer-link-hover);
    font-style: normal;
    font-weight: 500;
  }

  /* Contact Links */
  .contact-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-radius: var(--footer-radius);
    transition: var(--footer-transition);
  }

  .contact-link:hover,
  .contact-link:focus {
    background: rgba(16, 185, 129, 0.05);
    padding-left: 0.5rem;
    transform: none;
  }

  .contact-text,
  .city-text {
    color: inherit;
    line-height: 1.5;
    font-size: 0.875rem;
    font-weight: 400;
  }

  /* City Links - Same style as contact links */
  .city-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-radius: var(--footer-radius);
    transition: var(--footer-transition);
  }

  .city-link:hover,
  .city-link:focus {
    background: rgba(16, 185, 129, 0.05);
    padding-left: 0.5rem;
    transform: none;
  }

  /* Contact and Map Section */
  .contact {
    border-top: 1px solid var(--footer-border);
    padding: clamp(1.5rem, 4vw, 2rem) 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: clamp(1rem, 3vw, 1.75rem);
    align-items: start;
  }

  /* Copyright and Legal Section */
  .bottom {
    border-top: 1px solid var(--footer-border);
    padding: clamp(0.75rem, 2vw, 1rem) 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 0.8125rem;
    color: var(--footer-text);
  }

  .copy {
    font-weight: 500;
  }

  .policy {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .policy a {
    color: inherit;
    padding: 0.25rem 0.5rem;
    border-radius: calc(var(--footer-radius) / 2);
    transition: var(--footer-transition);
  }

  .policy a:hover,
  .policy a:focus {
    background: rgba(16, 185, 129, 0.1);
    color: var(--footer-link-hover);
    transform: none;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .top {
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 1.25rem;
    }

    .contact {
      grid-template-columns: 1fr 1.5fr;
    }
  }

  @media (max-width: 768px) {
    .top {
      grid-template-columns: 1.2fr 1fr 1fr;
      gap: 1rem;
    }

    .contact {
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .map-inner {
      min-height: 200px;
    }
  }

  @media (max-width: 640px) {
    .top {
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      text-align: center;
      justify-items: center;
    }

    .brand img {
      height: 100px;
    }

    .social {
      justify-content: center;
    }

    .contact {
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      text-align: left;
      justify-items: stretch;
    }

    .bottom {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .policy {
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .top {
      grid-template-columns: 1fr;
      text-align: center;
      justify-items: center;
    }

    .wrap {
      padding-inline: 1rem;
    }

    .contact {
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .map-inner {
      min-height: 160px;
    }

    h4 {
      font-size: 0.8125rem;
    }
  }

  @media (max-width: 375px) {
    .ftr {
      margin-top: 1.5rem;
    }

    .top,
    .contact {
      padding: 1.25rem 0;
    }

    .contact {
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .map-inner {
      min-height: 140px;
    }

    .bottom {
      padding: 0.625rem 0;
    }

    .policy {
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
  }
</style>
