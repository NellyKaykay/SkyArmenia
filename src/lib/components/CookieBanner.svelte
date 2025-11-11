<script lang="ts">
  import { onMount } from 'svelte';
  import { i18n } from '$lib/i18n';

  let showBanner = false;
  let showSettingsPanel = false;
  let cookiePreferences = {
    necessary: true, // Siempre true, no se puede desactivar
    analytics: false,
    marketing: false,
    functional: false
  };

  // i18n helper con fallback
  $: t = (k: string, fallback?: string) => {
    const v = $i18n[k];
    return v === k ? (fallback ?? k) : v;
  };

  onMount(() => {
    // Verificar si el usuario ya ha dado consentimiento
    const consent = localStorage.getItem('skyarmenia-cookie-consent');
    if (!consent) {
      showBanner = true;
    } else {
      // Cargar preferencias guardadas
      try {
        cookiePreferences = { ...cookiePreferences, ...JSON.parse(consent) };
      } catch (e) {
        console.warn('Error parsing cookie preferences:', e);
      }
    }
  });

  function acceptAll() {
    cookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    saveCookieConsent();
  }

  function acceptNecessary() {
    cookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    saveCookieConsent();
  }

  function saveCustomPreferences() {
    saveCookieConsent();
  }

  function saveCookieConsent() {
    localStorage.setItem('skyarmenia-cookie-consent', JSON.stringify(cookiePreferences));
    localStorage.setItem('skyarmenia-cookie-consent-date', new Date().toISOString());
    showBanner = false;

    // Disparar eventos para analytics/marketing
    if (cookiePreferences.analytics) {
      // Activar Google Analytics, etc.
      window.dispatchEvent(new CustomEvent('cookie-analytics-enabled'));
    }
    if (cookiePreferences.marketing) {
      // Activar marketing cookies
      window.dispatchEvent(new CustomEvent('cookie-marketing-enabled'));
    }
  }

  function showSettings() {
    showSettingsPanel = !showSettingsPanel;
  }
</script>

{#if showBanner}
<div class="cookie-banner" role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-description">
  <div class="cookie-content">
    <div class="cookie-text">
      <h3 id="cookie-title">{t('cookies.title', '🍪 Uso de Cookies')}</h3>
      <p id="cookie-description">
        {t('cookies.description', 'Utilizamos cookies para mejorar tu experiencia de navegación, analizar el tráfico del sitio y personalizar el contenido. Puedes gestionar tus preferencias de cookies a continuación.')}
      </p>
      
      <div class="cookie-settings" class:show={showSettingsPanel}>
        <div class="cookie-option">
          <label>
            <input type="checkbox" bind:checked={cookiePreferences.necessary} disabled>
            <span class="cookie-label">
              <strong>{t('cookies.necessary', 'Cookies Necesarias')}</strong>
              <small>{t('cookies.necessary.desc', 'Esenciales para el funcionamiento del sitio web')}</small>
            </span>
          </label>
        </div>

        <div class="cookie-option">
          <label>
            <input type="checkbox" bind:checked={cookiePreferences.functional}>
            <span class="cookie-label">
              <strong>{t('cookies.functional', 'Cookies Funcionales')}</strong>
              <small>{t('cookies.functional.desc', 'Mejoran la funcionalidad y personalización')}</small>
            </span>
          </label>
        </div>

        <div class="cookie-option">
          <label>
            <input type="checkbox" bind:checked={cookiePreferences.analytics}>
            <span class="cookie-label">
              <strong>{t('cookies.analytics', 'Cookies de Análisis')}</strong>
              <small>{t('cookies.analytics.desc', 'Nos ayudan a entender cómo usas el sitio web')}</small>
            </span>
          </label>
        </div>

        <div class="cookie-option">
          <label>
            <input type="checkbox" bind:checked={cookiePreferences.marketing}>
            <span class="cookie-label">
              <strong>{t('cookies.marketing', 'Cookies de Marketing')}</strong>
              <small>{t('cookies.marketing.desc', 'Personalizan anuncios según tus intereses')}</small>
            </span>
          </label>
        </div>
      </div>
    </div>

    <div class="cookie-actions">
      <button type="button" class="btn-settings" on:click={showSettings}>
        {t('cookies.settings', 'Configurar')}
      </button>
      <button type="button" class="btn-necessary" on:click={acceptNecessary}>
        {t('cookies.necessary.only', 'Solo Necesarias')}
      </button>
      <button type="button" class="btn-save" on:click={saveCustomPreferences}>
        {t('cookies.save', 'Guardar Preferencias')}
      </button>
      <button type="button" class="btn-accept" on:click={acceptAll}>
        {t('cookies.accept.all', 'Aceptar Todas')}
      </button>
    </div>

    <p class="cookie-policy">
      <a href="/privacy#{t('cookies.anchor', 'cookies')}" target="_blank">
        {t('cookies.policy', 'Más información sobre nuestra política de cookies')}
      </a>
    </p>
  </div>
</div>
{/if}

<style>
  .cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    color: #333;
    z-index: 9999;
    backdrop-filter: blur(8px);
    border-top: 3px solid var(--accent, #38b6ff);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  }

  .cookie-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 15px 20px;
    display: grid;
    gap: 15px;
  }

  .cookie-text h3 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cookie-text p {
    margin: 0 0 12px 0;
    line-height: 1.4;
    color: #555;
    font-size: 0.9rem;
  }

  .cookie-settings {
    display: none;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 10px;
    margin: 12px 0;
    padding: 12px;
    background: rgba(56, 182, 255, 0.05);
    border: 1px solid rgba(56, 182, 255, 0.2);
    border-radius: 8px;
  }

  .cookie-settings.show {
    display: grid;
  }

  .cookie-option {
    display: flex;
    align-items: flex-start;
  }

  .cookie-option label {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    width: 100%;
  }

  .cookie-option input[type="checkbox"] {
    margin-top: 2px;
    accent-color: var(--accent, #38b6ff);
  }

  .cookie-option input[type="checkbox"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cookie-label {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .cookie-label strong {
    color: #333;
    font-size: 0.9rem;
  }

  .cookie-label small {
    color: #666;
    font-size: 0.8rem;
    line-height: 1.3;
  }

  .cookie-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }

  .cookie-actions button {
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 100px;
    font-size: 0.85rem;
  }

  .btn-settings {
    background: transparent;
    color: #666;
    border: 1px solid #ccc;
  }

  .btn-settings:hover {
    background: rgba(56, 182, 255, 0.1);
    color: #333;
    border-color: var(--accent, #38b6ff);
  }

  .btn-necessary {
    background: #e0e0e0;
    color: #333;
    border: 1px solid #ccc;
  }

  .btn-necessary:hover {
    background: #d0d0d0;
  }

  .btn-save {
    background: var(--accent, #38b6ff);
    color: white;
  }

  .btn-save:hover {
    background: #2196f3;
  }

  .btn-accept {
    background: #4CAF50;
    color: white;
  }

  .btn-accept:hover {
    background: #45a049;
  }

  .cookie-policy {
    text-align: center;
    margin: 8px 0 0 0;
  }

  .cookie-policy a {
    color: var(--accent, #38b6ff);
    text-decoration: none;
    font-size: 0.85rem;
  }

  .cookie-policy a:hover {
    text-decoration: underline;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .cookie-content {
      padding: 12px 16px;
    }

    .cookie-settings {
      grid-template-columns: 1fr;
      padding: 10px;
    }

    .cookie-actions {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }

    .cookie-actions button {
      min-width: auto;
    }
  }

  @media (max-width: 480px) {
    .cookie-content {
      padding: 10px 12px;
    }

    .cookie-text h3 {
      font-size: 1rem;
    }

    .cookie-text p {
      font-size: 0.85rem;
    }

    .cookie-actions {
      gap: 6px;
    }

    .cookie-actions button {
      padding: 6px 10px;
      font-size: 0.8rem;
    }
  }
</style>